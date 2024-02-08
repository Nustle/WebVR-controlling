from cx_Freeze import setup, Executable

setup(
    name = "webVR",
    version = "0.1",
    description = "webVR",
    executables = [Executable("client.py")],
    options = {
        "build_exe": {
            "build_exe": "build"
        }
    }
)