import json
import os

from dotenv import load_dotenv
from alibabacloud_sts20150401.client import Client as StsClient
from alibabacloud_sts20150401 import models as sts_models
from alibabacloud_tea_openapi import models as open_api_models

load_dotenv()


class OSSService:

    OSS_KEY = os.getenv("OSS_KEY")
    OSS_SECRET = os.getenv("OSS_SECRET")
    OSS_BUCKET_NAME = os.getenv("OSS_BUCKET_NAME")
    OSS_FOLDER_PATH = os.getenv("OSS_FOLDER_PATH")
    OSS_ENDPOINT = os.getenv("OSS_ENDPOINT")
    OSS_ROLE_ARN = os.getenv("OSS_ROLE_ARN")  # RAM 角色 ARN
    OSS_REGION = os.getenv("OSS_REGION", "oss-cn-hangzhou")

    @classmethod
    def get_sts_token(cls) -> dict:
        config = open_api_models.Config(
            access_key_id=cls.OSS_KEY,
            access_key_secret=cls.OSS_SECRET,
            endpoint="sts.aliyuncs.com",
        )
        client = StsClient(config)

        # 2. 构建权限策略 —— 只允许上传到指定目录
        folder = cls.OSS_FOLDER_PATH.rstrip("/")
        policy = {
            "Version": "1",
            "Statement": [
                {
                    "Effect": "Allow",
                    "Action": ["oss:PutObject"],
                    "Resource": [f"acs:oss:*:*:{cls.OSS_BUCKET_NAME}/{folder}/*"],
                }
            ],
        }

        # 3. 调用 AssumeRole 签发临时凭证
        request = sts_models.AssumeRoleRequest(
            role_arn=cls.OSS_ROLE_ARN,
            role_session_name="web-upload",
            duration_seconds=1800,  # 30 分钟
            policy=json.dumps(policy),
        )
        response = client.assume_role(request)
        creds = response.body.credentials

        return {
            "access_key_id": creds.access_key_id,
            "access_key_secret": creds.access_key_secret,
            "security_token": creds.security_token,
            "expiration": creds.expiration,
            "bucket": cls.OSS_BUCKET_NAME,
            "region": cls.OSS_REGION,
            "folder": folder,
        }
