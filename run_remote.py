import os
import paramiko
import time
from dotenv import load_dotenv

load_dotenv()
HOST = os.getenv("SFTP_HOST", "141.95.45.75")
PORT = int(os.getenv("SFTP_PORT", 1624))
USER = os.getenv("SFTP_USER", "wcmenxtm")
PASS = os.getenv("SFTP_PASS")

def execute_remote(cmd):
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    try:
        client.connect(hostname=HOST, port=PORT, username=USER, password=PASS)
        print(f"Executing: {cmd}")
        stdin, stdout, stderr = client.exec_command(cmd)
        exit_status = stdout.channel.recv_exit_status()
        out = stdout.read().decode('utf-8')
        err = stderr.read().decode('utf-8')
        print(f"Exit: {exit_status}\nOUT:\n{out}\nERR:\n{err}")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    commands = [
        "cd /home/wcmenxtm/portfolio && npm install --omit=dev",
        "mkdir -p /home/wcmenxtm/portfolio/tmp && touch /home/wcmenxtm/portfolio/tmp/restart.txt",
        "cat /home/wcmenxtm/portfolio/stderr.log | tail -n 20"
    ]
    for c in commands:
        execute_remote(c)
