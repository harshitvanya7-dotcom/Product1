from app import create_app

app = create_app()

if __name__ == "__main__":
    # debug True for dev. Use a proper server (gunicorn/uvicorn) for production.
    app.run(host="127.0.0.1", port=5000, debug=True)

