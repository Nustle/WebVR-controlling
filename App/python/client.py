#!/usr/bin/python3
import cv2
import json
import mediapipe as mp
import socket


mp_hands = mp.solutions.hands

cap = cv2.VideoCapture(0)

palm_standard_hor = 71.0466227224837
palm_standard_vert = 100.03117166580984
z_standard = 50
hor_standard_palm = 6
vert_standard_palm = 8

global is_calibrated

def send_data_to_server(data):
    host = '185.180.230.108'  # IP-адрес сервера
    port = 8000  # Порт сервера

    client_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    client_socket.connect((host, port))

    try:
        # Кодирование и отправка данных на сервер
        encoded_data = json.dumps(data).encode('utf-8')
        client_socket.send(encoded_data)
        print("Sent data to server:", data)

    except KeyboardInterrupt:
        print("Client shutting down.")
        client_socket.close()


def main():

    is_calibrated = False

    with mp_hands.Hands(
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5) as hands:

        while cap.isOpened():
            success, image = cap.read()
            if not success:
                print("Ignoring empty camera frame.")
                continue

            image = cv2.cvtColor(cv2.flip(image, -1), cv2.COLOR_BGR2RGB)

            image.flags.writeable = False

            results = hands.process(image)

            image_height, image_width, _ = image.shape

            x = []
            y = []
            z = []

            if results.multi_hand_landmarks != None:
                for handLandmarks in results.multi_hand_landmarks:
                    for point in mp_hands.HandLandmark:
                        normalized_landmark = handLandmarks.landmark[point]

                        x.append(normalized_landmark.x)
                        y.append(normalized_landmark.y)
                        z.append(normalized_landmark.z)

                # в пикселях
                palm_vert = (((x[9] - x[0]) * image_width) ** 2 + ((y[9] - y[0]) * image_height) ** 2) ** 0.5
                palm_hor = (((x[17] - x[5]) * image_width) ** 2 + ((y[17] - y[5]) * image_height) ** 2) ** 0.5

                if not is_calibrated:

                    # относительно размеров изображения
                    p_vert = ((x[9] - x[0]) ** 2 + (y[9] - y[0]) ** 2) ** 0.5
                    p_hor = ((x[17] - x[5]) ** 2 + (y[17] - y[5]) ** 2) ** 0.5

                    if (0.2 <= p_vert <= 0.21) or (0.1 <= p_hor <= 0.11):
                        palm_standard_hor = palm_hor
                        palm_standard_vert = palm_vert
                        is_calibrated = True
                        print("Successfully calibrated")
                    elif (p_vert < 0.2) or (p_hor < 0.1):
                        print("Closer")
                        continue
                    elif (p_vert > 0.22) or (p_hor > 0.12):
                        print("Farther")
                        continue

                if palm_vert >= palm_hor:
                    z_tek = palm_standard_vert * z_standard / palm_vert
                    pix = vert_standard_palm / palm_vert
                else:
                    z_tek = palm_standard_hor * z_standard / palm_hor
                    pix = hor_standard_palm / palm_hor

                x_tek = pix * x[8] * image_width
                y_tek = pix * y[8] * image_height

                payload = {
                    'x8': int(x_tek),
                    'y8': int(y_tek),
                    'z8': int(z_tek)
                }

                send_data_to_server(payload)

    cap.release()


if __name__ == "__main__":
    main()
