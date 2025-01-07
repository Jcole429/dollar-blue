import sys
import json
from db_utils import get_latest_blue
from http.server import BaseHTTPRequestHandler


class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        try:
            data = get_latest_blue()
            json_data = json.dumps(data)

            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()

            self.wfile.write(json_data.encode('utf-8'))
        except Exception as e:
            error = f"Error during get_latest_blue(): {e}"
            print(error, file=sys.stderr)

            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.end_headers()

            error_response = json.dumps({"error": "Internal Server Error", "details": str(e)})
            self.wfile.write(error_response.encode('utf-8'))
