from http.server import BaseHTTPRequestHandler, HTTPServer
from datetime import datetime

class MyHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        now = datetime.now()
        date_time_string = now.strftime("%Y-%m-%d %H:%M:%S")

        self.send_response(200)
        self.send_header("Content-type", "text/plain")
        self.end_headers()
        message = f"Hello, World!\nCurrent date and time: {date_time_string}\n"
        self.wfile.write(message.encode())

if __name__ == "__main__":
    server_address = ('', 3000)
    httpd = HTTPServer(server_address, MyHandler)
    print('Server running at http://localhost:3000/')
    httpd.serve_forever()
