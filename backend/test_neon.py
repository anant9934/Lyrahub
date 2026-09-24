import socket
host_pooler = "ep-wispy-mountain-a7s9mb0a-pooler.ap-southeast-2.aws.neon.tech"
host_direct = "ep-wispy-mountain-a7s9mb0a.ap-southeast-2.aws.neon.tech"
port = 5432

def test_host(host):
    try:
        print(f"Testing {host}...")
        sock = socket.create_connection((host, port), timeout=3)
        print("Success!")
        sock.close()
    except Exception as e:
        print(f"Failed: {e}")

test_host(host_pooler)
test_host(host_direct)
