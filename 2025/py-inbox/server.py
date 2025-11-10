'''
A little tagged message inbox server.
Messages are pushed into a tag and pulled from a tag.

Example interaction:
- Client A:
  - GET localhost:8080/push/test_a/abc -> Received.
  - GET localhost:8080/push/test_a/def -> Received.
  - GET localhost:8080/push/test_b/ghi -> Received.
- Client B:
  - GET localhost:8080/pull/test_a -> abc
  - GET localhost:8080/pull/test_a -> def
  - GET localhost:8080/pull/test_a <blocked>
- Client A:
  - GET localhost:8080/push/test_a/jkl -> Received.
- Client B:
  - <unblocked> -> jkl
  - GET localhost:8080/pull/test_b -> ghi
'''

import http.server
import socketserver
import threading

tagged_inboxes = {}

class Inbox:
  def __init__(self):
    self.has_messages = threading.Event()
    self.messages = []

def get_inbox(tag):
  if not tag in tagged_inboxes:
    tagged_inboxes[tag] = Inbox()
  return tagged_inboxes[tag]

class RequestHandler(http.server.BaseHTTPRequestHandler):
  def send_usage(self):
    self.send_error(400, 'Usage /push/<tag>/<message> or /pull/<tag> .')

  def do_GET(self):
    parameters = self.path.split('/', 3)[1:]
    if len(parameters) < 2:
      self.send_usage()
      return

    command, tag = parameters[:2]

    if command == 'push':
      if len(parameters) != 3:
        self.send_usage()
        return
      message = parameters[2]
      inbox = get_inbox(tag)
      inbox.messages.append(message)
      inbox.has_messages.set()
      self.send_response(200)
      self.send_header('Content-Type', 'text/plain')
      self.end_headers()
      self.wfile.write(b'Received.')
      return

    if command == 'pull':
      if len(parameters) != 2:
        self.send_usage()
        return
      inbox = get_inbox(tag)
      inbox.has_messages.wait()
      message = inbox.messages.pop(0)
      if len(inbox.messages) == 0:
        inbox.has_messages.clear()
      self.send_response(200)
      self.send_header('Content-Type', 'text/plain')
      self.end_headers()
      self.wfile.write(message.encode('utf-8'))
      return

    self.send_usage()

class ThreadedTCPServer(socketserver.ThreadingMixIn, socketserver.TCPServer):
  allow_reuse_address = True

if __name__ == '__main__':
  ThreadedTCPServer(('', 8080), RequestHandler).serve_forever()
