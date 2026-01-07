import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

const s3 = new AWS.S3({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

export class S3Service {
  static async uploadDocument(file: Express.Multer.File, organizationId: string): Promise<string> {
    const key = `${organizationId}/${uuidv4()}-${file.originalname}`;
    
    await s3.putObject({
      Bucket: process.env.S3_BUCKET_NAME!,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      ServerSideEncryption: 'AES256',
    }).promise();

    return `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
  }

  static async getSignedUrl(fileUrl: string): Promise<string> {
    const key = fileUrl.split('.com/')[1];
    
    return s3.getSignedUrlPromise('getObject', {
      Bucket: process.env.S3_BUCKET_NAME!,
      Key: key,
      Expires: 3600,
    });
  }

  static async deleteDocument(fileUrl: string): Promise<void> {
    const key = fileUrl.split('.com/')[1];
    
    await s3.deleteObject({
      Bucket: process.env.S3_BUCKET_NAME!,
      Key: key,
    }).promise();
  }
}
