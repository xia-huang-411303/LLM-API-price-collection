from flask import Flask, request, jsonify
import requests
import os
import json

app = Flask(__name__)
UPLOAD_FOLDER = '../data'
RESULTS_FILE = os.path.join(UPLOAD_FOLDER, 'results.json')

# Ensure the upload folder exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Load API key from environment variable
API_KEY = os.environ.get('API_KEY')


@app.route('/api/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    filepath = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(filepath)
    return jsonify({"message": "File uploaded successfully", "filepath": filepath}), 200


@app.route('/api/run-workflow', methods=['POST'])
def run_workflow():
    response = requests.post(
        'http://863deprd.tpddns.cn/v1/workflows/run',
        headers={
            'Authorization': f'Bearer {API_KEY}',
            'Content-Type': 'application/json'
        },
        json={
            "inputs": {},
            "response_mode": "blocking",
            "user": "abc-123"
        }
    )

    if response.status_code != 200:
        return jsonify({"error": "Failed to run workflow"}), response.status_code

    data = response.json()
    results = data['data']['outputs']['results']['results']

    with open(RESULTS_FILE, 'w') as f:
        json.dump(results, f, indent=4)

    return jsonify({"message": "Workflow executed successfully"}), 200


@app.route('/api/get-results', methods=['GET'])
def get_results():
    results = []
    if os.path.exists(RESULTS_FILE):
        with open(RESULTS_FILE, 'r') as f:
            results = json.load(f)
    return jsonify({"results": results}), 200


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
