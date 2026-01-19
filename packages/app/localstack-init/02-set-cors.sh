#!/bin/bash
set -e

BUCKET_NAME="my-bucket"

cat <<EOF > /tmp/cors.json
{
  "CORSRules": [
    {
      "AllowedOrigins": ["http://localhost:3000"],
      "AllowedMethods": ["GET", "PUT", "POST", "HEAD"],
      "AllowedHeaders": ["*"],
      "ExposeHeaders": ["ETag"],
      "MaxAgeSeconds": 3000
    }
  ]
}
EOF

echo "Applying CORS to bucket: $BUCKET_NAME"
awslocal s3api put-bucket-cors \
  --bucket $BUCKET_NAME \
  --cors-configuration file:///tmp/cors.json
