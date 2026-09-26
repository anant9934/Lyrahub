import os
import boto3
from botocore.exceptions import ClientError
from .base import StorageProvider

class R2StorageProvider(StorageProvider):
    def __init__(self):
        account_id = os.getenv("R2_ACCOUNT_ID")
        access_key = os.getenv("R2_ACCESS_KEY")
        secret_key = os.getenv("R2_SECRET_KEY")
        self.bucket = os.getenv("R2_BUCKET")

        if not all([account_id, access_key, secret_key, self.bucket]):
            raise ValueError("R2 credentials missing in environment variables.")

        self.s3_client = boto3.client(
            "s3",
            endpoint_url=f"https://{account_id}.r2.cloudflarestorage.com",
            aws_access_key_id=access_key,
            aws_secret_access_key=secret_key,
            region_name="auto"
        )

    async def generate_upload_url(
        self, key: str, content_type: str, expires: int = 900
    ) -> str:
        return self.s3_client.generate_presigned_url(
            "put_object",
            Params={
                "Bucket": self.bucket,
                "Key": key,
                "ContentType": content_type
            },
            ExpiresIn=expires
        )

    async def file_exists(self, key: str) -> bool:
        try:
            self.s3_client.head_object(Bucket=self.bucket, Key=key)
            return True
        except ClientError:
            return False

    async def get_file_bytes(self, key: str) -> bytes:
        response = self.s3_client.get_object(Bucket=self.bucket, Key=key)
        return response['Body'].read()

    async def get_download_url(
        self, key: str, expires: int = 900
    ) -> str:
        return self.s3_client.generate_presigned_url(
            "get_object",
            Params={
                "Bucket": self.bucket,
                "Key": key
            },
            ExpiresIn=expires
        )

    async def delete_file(self, key: str) -> bool:
        try:
            self.s3_client.delete_object(Bucket=self.bucket, Key=key)
            return True
        except ClientError:
            return False
