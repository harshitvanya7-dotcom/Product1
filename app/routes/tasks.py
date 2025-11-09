from flask import Blueprint, request, jsonify, abort

tasks_bp = Blueprint("tasks", __name__)

# In-memory store (simple). Format: {id: {id, title, description, status}}
_tasks = {}
_next_id = 1

def _get_next_id():
    global _next_id
    nid = _next_id
    _next_id += 1
    return nid

@tasks_bp.route("/", methods=["GET"])
def get_tasks():
    # return list of tasks
    return jsonify(list(_tasks.values())), 200

@tasks_bp.route("/", methods=["POST"])
def create_task():
    data = request.get_json() or {}
    title = data.get("title", "").strip()
    if not title:
        return jsonify({"error": "title is required"}), 400

    tid = _get_next_id()
    task = {
        "id": tid,
        "title": title,
        "description": data.get("description", ""),
        "status": data.get("status", "pending")  # pending / done
    }
    _tasks[tid] = task
    return jsonify(task), 201

@tasks_bp.route("/<int:task_id>", methods=["PUT"])
def update_task(task_id):
    if task_id not in _tasks:
        return jsonify({"error": "task not found"}), 404

    data = request.get_json() or {}
    task = _tasks[task_id]
    # update fields if present
    if "title" in data:
        title = data.get("title", "").strip()
        if not title:
            return jsonify({"error": "title cannot be empty"}), 400
        task["title"] = title
    if "description" in data:
        task["description"] = data.get("description", "")
    if "status" in data:
        task["status"] = data.get("status", task["status"])
    _tasks[task_id] = task
    return jsonify(task), 200

@tasks_bp.route("/<int:task_id>", methods=["DELETE"])
def delete_task(task_id):
    if task_id not in _tasks:
        return jsonify({"error": "task not found"}), 404
    del _tasks[task_id]
    return jsonify({"message": "deleted"}), 200

# optional: clear all tasks (useful during dev)
@tasks_bp.route("/_clear", methods=["POST"])
def clear_tasks():
    global _tasks, _next_id
    _tasks = {}
    _next_id = 1
    return jsonify({"message": "cleared"}), 200

