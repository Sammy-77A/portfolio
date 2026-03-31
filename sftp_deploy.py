import paramiko
import os

host = "141.95.45.75"
port = 1624
username = "wcmenxtm"
password = "1xl3)dLU23[KAv"

local_dist = r"c:\Users\sam\Documents\portfolio\repo\client\dist"
local_server = r"c:\Users\sam\Documents\portfolio\repo\server"

remote_public = "/home/wcmenxtm/public_html"
remote_app = "/home/wcmenxtm/portfolio"

def sftp_upload_dir(sftp, localBasePath, remoteBasePath):
    for root, dirs, files in os.walk(localBasePath):
        for d in dirs:
            local_dir = os.path.join(root, d)
            rel_path = os.path.relpath(local_dir, localBasePath)
            remote_dir = remoteBasePath + "/" + rel_path.replace("\\", "/")
            try:
                sftp.mkdir(remote_dir)
            except IOError:
                pass 

        for f in files:
            local_file = os.path.join(root, f)
            rel_path = os.path.relpath(local_file, localBasePath)
            remote_file = remoteBasePath + "/" + rel_path.replace("\\", "/")
            print(f"Uploading {local_file} -> {remote_file}")
            sftp.put(local_file, remote_file)

try:
    transport = paramiko.Transport((host, port))
    transport.connect(username=username, password=password)
    sftp = paramiko.SFTPClient.from_transport(transport)

    print(f"Deploying frontend to {remote_public}...")
    sftp_upload_dir(sftp, local_dist, remote_public)

    print(f"Deploying backend to {remote_app}...")
    for f in ['app.js', 'package.json']:
        lpath = os.path.join(local_server, f)
        if os.path.exists(lpath):
            rpath = remote_app + "/" + f
            print(f"Uploading {lpath} -> {rpath}")
            sftp.put(lpath, rpath)

    print("Deployment completed successfully.")

except Exception as e:
    print(f"Deployment failed: {e}")
finally:
    try:
        sftp.close()
        transport.close()
    except:
        pass
