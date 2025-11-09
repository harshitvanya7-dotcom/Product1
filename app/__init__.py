from flask import Flask
from flask_cors import CORS

def create_app():
    app = Flask(__name__, static_folder="static", static_url_path="/")
    # Allow frontend served from same server or different origin during dev
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # register blueprints
    from app.routes.tasks import tasks_bp
    app.register_blueprint(tasks_bp, url_prefix="/api/tasks")

    # serve index at root
    @app.route("/", methods=["GET"])
    def index():
        return app.send_static_file("index.html")

    return app
