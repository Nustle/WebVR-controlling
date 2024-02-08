#!/usr/bin/python3
import socket
import asyncio
import websockets
import threading

queue = asyncio.Queue() # Глобальная очередь для передачи данных между потоками

def start_server(loop):
    host = '0.0.0.0'  # Принимать соединения с любых адресов
    port = 8000      # Порт для прослушивания

    server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    server_socket.bind((host, port))
    server_socket.listen(5)

    print("Server listening on {}:{}".format(host, port))

    while True:
        client_socket, addr = server_socket.accept()
        print("Accepted connection from {}:{}".format(addr[0], addr[1]))

        # Обработка данных от клиента в отдельном потоке
        threading.Thread(target=client_handler, args=(client_socket, loop)).start()

def client_handler(client_socket, loop):

    while True:
        data = client_socket.recv(4096)
        if not data:
            break

        # Декодирование и вывод принятых данных
        data = data.decode('utf-8')
        print("get data from client:", data)

        # Помещаем данные в очередь для отправки через WebSocket
        asyncio.run_coroutine_threadsafe(queue.put(data), loop)

    client_socket.close()

async def start_websocket_server(websocket, path):
    host = '0.0.0.0'
    port = 8001

    print("WebSocket server listen on {}:{}".format(host, port))

    while True:
        data = await queue.get()
        await websocket.send(data)
        print(f"send data for ws client: {data}")

if __name__ == "__main__":
    loop = asyncio.get_event_loop()

    # Запуск TCP сервера в отдельном потоке
    threading.Thread(target=start_server, args=(loop,)).start()

    # Запуск WebSocket сервера в главном потоке
    main = websockets.serve(start_websocket_server, '0.0.0.0', 8001)

    loop.run_until_complete(main)
    loop.run_forever()
