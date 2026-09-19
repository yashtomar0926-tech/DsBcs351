from functools import wraps

from flask import Flask, request, jsonify, session
from flask_cors import CORS

from config import Config
from models import db, User, Student

app = Flask(__name__)
app.config.from_object(Config)

# Allow the frontend (served from a different origin/port) to send the
# session cookie along with its requests.
CORS(app, supports_credentials=True)

db.init_app(app)

with app.app_context():
    db.create_all()


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def login_required(f):
    """Protect a route so it can only be accessed by a logged-in user."""
    @wraps(f)
    def decorated(*args, **kwargs):
        if "user_id" not in session:
            return jsonify({"error": "Authentication required. Please log in."}), 401
        return f(*args, **kwargs)
    return decorated


def student_payload_errors(data, partial=False):
    """Basic validation for incoming student data."""
    required_fields = ["roll_no", "name", "email"]
    if not partial:
        for field in required_fields:
            if not data.get(field):
                return f"'{field}' is required."
    if "year" in data and data["year"] not in (None, ""):
        try:
            int(data["year"])
        except (ValueError, TypeError):
            return "'year' must be a number."
    return None


# ---------------------------------------------------------------------------
# Auth routes
# ---------------------------------------------------------------------------
@app.route("/api/register", methods=["POST"])
def register():
    data = request.get_json(silent=True) or {}
    username = data.get("username", "").strip()
    email = data.get("email", "").strip()
    password = data.get("password", "")

    if not username or not email or not password:
        return jsonify({"error": "username, email and password are required."}), 400

    if User.query.filter((User.username == username) | (User.email == email)).first():
        return jsonify({"error": "A user with that username or email already exists."}), 409

    user = User(username=username, email=email)
    user.set_password(password)
    db.session.add(user)
    db.session.commit()

    return jsonify({"message": "Registration successful.", "user": user.to_dict()}), 201


@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json(silent=True) or {}
    username = data.get("username", "").strip()
    password = data.get("password", "")

    user = User.query.filter_by(username=username).first()
    if not user or not user.check_password(password):
        return jsonify({"error": "Invalid username or password."}), 401

    session["user_id"] = user.id
    session["username"] = user.username

    return jsonify({"message": "Login successful.", "user": user.to_dict()}), 200


@app.route("/api/logout", methods=["POST"])
def logout():
    session.clear()
    return jsonify({"message": "Logged out successfully."}), 200


@app.route("/api/check-auth", methods=["GET"])
def check_auth():
    if "user_id" in session:
        return jsonify({"authenticated": True, "username": session.get("username")}), 200
    return jsonify({"authenticated": False}), 200


# ---------------------------------------------------------------------------
# Student CRUD routes (all protected)
# ---------------------------------------------------------------------------
@app.route("/api/students", methods=["GET"])
@login_required
def get_students():
    search = request.args.get("search", "").strip()
    query = Student.query
    if search:
        like = f"%{search}%"
        query = query.filter(
            (Student.name.ilike(like))
            | (Student.roll_no.ilike(like))
            | (Student.email.ilike(like))
            | (Student.course.ilike(like))
        )
    students = query.order_by(Student.id.desc()).all()
    return jsonify({"students": [s.to_dict() for s in students]}), 200


@app.route("/api/students/<int:student_id>", methods=["GET"])
@login_required
def get_student(student_id):
    student = Student.query.get(student_id)
    if not student:
        return jsonify({"error": "Student not found."}), 404
    return jsonify({"student": student.to_dict()}), 200


@app.route("/api/students", methods=["POST"])
@login_required
def create_student():
    data = request.get_json(silent=True) or {}
    error = student_payload_errors(data)
    if error:
        return jsonify({"error": error}), 400

    if Student.query.filter_by(roll_no=data["roll_no"]).first():
        return jsonify({"error": "A student with that roll number already exists."}), 409
    if Student.query.filter_by(email=data["email"]).first():
        return jsonify({"error": "A student with that email already exists."}), 409

    student = Student(
        roll_no=data["roll_no"].strip(),
        name=data["name"].strip(),
        email=data["email"].strip(),
        phone=data.get("phone", "").strip() or None,
        course=data.get("course", "").strip() or None,
        year=int(data["year"]) if data.get("year") not in (None, "") else None,
        address=data.get("address", "").strip() or None,
    )
    db.session.add(student)
    db.session.commit()

    return jsonify({"message": "Student added successfully.", "student": student.to_dict()}), 201


@app.route("/api/students/<int:student_id>", methods=["PUT"])
@login_required
def update_student(student_id):
    student = Student.query.get(student_id)
    if not student:
        return jsonify({"error": "Student not found."}), 404

    data = request.get_json(silent=True) or {}
    error = student_payload_errors(data, partial=True)
    if error:
        return jsonify({"error": error}), 400

    if "roll_no" in data and data["roll_no"] != student.roll_no:
        if Student.query.filter_by(roll_no=data["roll_no"]).first():
            return jsonify({"error": "A student with that roll number already exists."}), 409
        student.roll_no = data["roll_no"].strip()

    if "email" in data and data["email"] != student.email:
        if Student.query.filter_by(email=data["email"]).first():
            return jsonify({"error": "A student with that email already exists."}), 409
        student.email = data["email"].strip()

    if "name" in data:
        student.name = data["name"].strip()
    if "phone" in data:
        student.phone = data["phone"].strip() or None
    if "course" in data:
        student.course = data["course"].strip() or None
    if "year" in data:
        student.year = int(data["year"]) if data["year"] not in (None, "") else None
    if "address" in data:
        student.address = data["address"].strip() or None

    db.session.commit()
    return jsonify({"message": "Student updated successfully.", "student": student.to_dict()}), 200


@app.route("/api/students/<int:student_id>", methods=["DELETE"])
@login_required
def delete_student(student_id):
    student = Student.query.get(student_id)
    if not student:
        return jsonify({"error": "Student not found."}), 404

    db.session.delete(student)
    db.session.commit()
    return jsonify({"message": "Student deleted successfully."}), 200


if __name__ == "__main__":
    app.run(debug=True, port=5000)
