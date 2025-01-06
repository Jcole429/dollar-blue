from fetch_data import fetch_latest_blue, fetch_latest_crypto
from db_utils import check_and_insert_data
from logger import logger
from http.server import BaseHTTPRequestHandler


class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        try:
            data_1 = fetch_latest_blue()
            data_2 = fetch_latest_crypto()

            # Store in the database
            check_and_insert_data(data_1["type"], data_1["source"], data_1["updated_date"], data_1["buy"], data_1["sell"])
            check_and_insert_data(data_2["type"], data_2["source"], data_2["updated_date"], data_2["buy"], data_2["sell"])
            self.send_response(200)
            self.send_header('Content-type', 'text/plain')
            self.end_headers()
            self.wfile.write('Data fetched and stored successfully.'.encode('utf-8'))
        except Exception as e:
            error = f"Error during fetch and store: {e}"
            self.send_response(500)
            self.send_header('Content-type', 'text/plain')
            self.end_headers()
            self.wfile.write(f'Internal Server Error\n{error}'.encode('utf-8'))
