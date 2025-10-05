// src/pages/api/sendMail.js
import { Readable } from 'node:stream';
import { google } from 'googleapis';
import { UAParser } from 'ua-parser-js';

export const prerender = false;
// Astro'da API endpoint'leri export edilen fonksiyonlardan oluşur
export async function POST({ request }) {
  try {
    // Request verilerini al
    const { files, userInfo, token } = await request.json();
    const userAgent = request.headers.get('user-agent') || '';
    const parser = new UAParser(userAgent);
    const deviceInfo = parser.getResult(); // Tarayıcı, OS, cihaz bilgilerini ayrıştır

    /* reCAPTCHA doğrulama kodu (isteğe bağlı olarak kullanılabilir)
    const recaptchaResponse = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=YOUR_SECRET_KEY&response=${token}`,
    });
  
    const { success, score } = await recaptchaResponse.json();
    
    if (!success || score < 0.5) {
      return new Response(
        JSON.stringify({ message: 'reCAPTCHA verification failed.' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    */

    let folder = null;
    let uploadedFiles = null;
    let folderId = null;
    
    // IP adresini alma (Astro'da request.ip farklı şekilde alınır)
    const ip = request.headers.get('x-forwarded-for') || '0.0.0.0';

    const languageMap = {
      en: "English",
      ru: "Russian",
      tr: "Turkish",
      it: "Italian",
      bg: "Bulgarian",
      id: "Indonesian"
    };

    userInfo.language = languageMap[userInfo.language] || "English";
     
    // Dosya yükleme işlemi
    if (files && files.length > 0) {
      const serviceAccount = {
        client_email: "site-933@custom-octagon-445607-d8.iam.gserviceaccount.com",
        private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDA/SwIa3ESh75/\nkhMNrqyl7z39EKG5WgAdJgUvXKwe6YvSB/KhRwmE07MoyKQATkcqwfvELrXK0Y16\nvjOZ72LZiBeTho0FK3dLFGT++5bWS0xqxdqku3fod19bKUin0gMc16lkE6qOz2zn\nhtnLNCzIHNPFLB0Q+BoRtTodf+RaMbUMQffN5oV4/o4yTG1ZoB77CbJY7GpKOAr0\n+3puYG9Nku2nvjjL8maGE/qlNeQpZAq4bw1KAYH53qFFEOB5xu+SezM9U1NQLzAc\nXm7eJLPpC49uf8vP5qj8I11DFEWFj8VbXE2WdiYSge8rBBcr2BzKbNiIZ8RAfDRG\n2ir5HOcJAgMBAAECggEAFPiuBfA0UQYtPkxPrmdH3Z7vhoYofNgki7EA/pI8e1N3\nsogokTwDSHV/fN6+FkZrV2B4YmuNAmWJJp3FRQ9iwi7BbnJASsqGuRhAmAYbmwfY\nXatIb37rsHhLBWtUDjXfyWI/cbTtY31zi9P3QNdXnRtSK+qiR0tz/G6hdRPbwFfW\ncQVugeYPSr0ZcVxTKwxOmSj45LxdJ6kzoRf49bFvZG4B39C5UL3MJn5PJNmqZuu2\nWDOB/Cqj2+wUvDVGi+YLlKWSYocX5do9Jfp+g6jjINrCZzSrkBIH/jdlXYr0IHp3\nhqtguaErNYYoPHn8Y2aE/Gqh8ulolrhUGgJwQSWjjQKBgQD78pXZ2IL3Gd11zOL5\n6RsahQBCRZ/aAvl6uED9vUFsZGEH+Q01V51rCkBdH9Rk9WA9mqj8dr9e62IdjXy1\ng12jFkzlVKx212MuTpq/ulguiXvQmOIISAbCRVHWOS9GpTZ77p3u+XPt7CbepH6n\nqISj5R2uxWoHE1QMOTJSibelDwKBgQDEF9HUe9U5fB/IX9YoldCsgb830UF+9o4p\nrs0tauc1BoBDDd5fmtnI/f8yGEDxsjUZN+yYBTCR8Zlzr731aGOKxIk2VhFzoSLX\nlSY4WshoHzuoMHZ4b4FiHCyMJTDFYdTJjsO8RBq9oXjG7pEZYgfi896NmhVBCTml\nGXyUhdqiZwKBgQC/pCQr0i68OmZjxncX1SISp/wsbL1MnVqa6DA3UY/EHQ5ZfC15\n160b0G5o518tdB/CfDPx5Xlnf+/fvtGPV98PwFS5VBDjTK5aeNvo3ptYuqb9Ymz8\nE51ghE3dfx3gxKaO2lAziHeQEEL4s3LLoLlT2WEcoXkm7KLPsWn/slWILQKBgQCH\n5qo5xQjlqiysxh66SfoxVEqd+JyXzXCBWvBABdLvYO4LitUPFVbSgZYXtc9sssEy\nFRwXz6D1xKdBEg9owUwbpFIkIko+BPMMzgWLEP/LibniupOgrEbTJAuLpUrDwSWj\n+xmUpO6TdhEqbbSKDvLAS5t2L8+DH02gKqW4mXwJCQKBgEO0qvehR3fMl6R9ZZ3u\nqcXlU/fR93zLYJPG2E0lJ1teGqRsK8Pe/Ukm6nF2f4FRa3dmMruff5T/cUTINdGI\nsaoSwdbTMIQeoxSxNebDG5Sh/knxJIgXyBVDeXoCb1OwxQ7POCCh8BP8v7Oo6ozR\nITvBHZiJjwGWBw6oTOzvqSib\n-----END PRIVATE KEY-----\n".replace(/\\n/g, '\n'),
       };

      const auth = new google.auth.GoogleAuth({
        credentials: serviceAccount,
        scopes: ['https://www.googleapis.com/auth/drive.file'],
      });

      const drive = google.drive({ version: 'v3', auth });

      // Kullanıcının e-posta bilgisiyle bir klasör oluştur
      const folderResponse = await drive.files.create({
        requestBody: {
          name: userInfo.email,
          mimeType: 'application/vnd.google-apps.folder',
          parents: ["1K7uX3jTVUg5LHLAFLSclAA-7SSAErjKo"], // Add to parent folder
        },
      });

      folderId = folderResponse.data.id;

      // Klasörü link ile erişilebilir yap
      await drive.permissions.create({
        fileId: folderId,
        requestBody: {
          role: 'reader',
          type: 'anyone',
        },
      });

      // Klasör linkini al
      folder = await drive.files.get({
        fileId: folderId,
        fields: 'webViewLink',
      });

      // Tüm dosyaları klasöre yükle
      uploadedFiles = await Promise.all(files.map(async (fileData) => {
        const base64Content = fileData.base64Data.replace(/^data:.*;base64,/, '');
        const fileBuffer = Buffer.from(base64Content, 'base64');

        const fileResponse = await drive.files.create({
          requestBody: {
            name: fileData.fileName,
            mimeType: fileData.mimeType,
            parents: [folderId],
          },
          media: {
            mimeType: fileData.mimeType,
            body: Readable.from(fileBuffer),
          },
        }, {
          // Timeout ve yeniden deneme seçenekleri ekle
          timeout: 60000,
          retry: true,
        });

        return {
          fileName: fileData.fileName,
          fileId: fileResponse.data.id
        };
      }));
    }

    // Verileri Zapier webhook'una gönder
    const webhookUrl = "https://hooks.zapier.com/hooks/catch/19822017/287v8tw/";
    const zapierResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userInfo: {
          fullName: userInfo.fullName,
          email: userInfo.email,
          phone: userInfo.phone,
          message: userInfo.message,
          uploadDate: new Date().toISOString(),
          ipAddress: ip,
          language: userInfo.language,
          device: userInfo.device,
          utmSource: userInfo.utmSource,
          utmMedium: userInfo.utmMedium,
          utmCampaign: userInfo.utmCampaign,
          utmTerm: userInfo.utmTerm,
          utmAd: userInfo.utmAd,
          utmPromo: userInfo.utmPromo,
          utmContent: userInfo.utmContent,
          utmAdgroup: userInfo.utmAdgroup,
          utmDevice: userInfo.utmDevice,
          utmKeyword: userInfo.utmKeyword,
          gcLid: userInfo.gcLid,
          theme: userInfo.theme,
          scrollDepth: userInfo.scrollDepth,
          durationTime: userInfo.durationTime,
          formType: userInfo.formType,
          // recaptchaScore: score,
          webSiteDomain: request.headers.get('host'),
          deviceInfo: deviceInfo.os.name + ' ' + deviceInfo.os.version + ' ' + deviceInfo.browser.name + ' ' + deviceInfo.browser.version
        },
        uploadDetails: {
          folderLink: (files && files.length > 0) ? folder.data.webViewLink : null,
          folderId: (files && files.length > 0) ? folderId : null,
          numberOfFiles: (files && files.length > 0) ? files.length : null,
          files: (files && files.length > 0) ? uploadedFiles : null,
        }
      }),
    });

    if (!zapierResponse.ok) {
      console.error('Zapier webhook error:', await zapierResponse.text());
    }

    // Astro'da Response sınıfı kullanılır
    return new Response(
      JSON.stringify({
        message: 'Files uploaded successfully',
        folderLink: (files && files.length > 0) ? folder.data.webViewLink : "no link!",
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error('Upload error:', error);
    
    return new Response(
      JSON.stringify({ message: 'Error: ' + error.message }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
}