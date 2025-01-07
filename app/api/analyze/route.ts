import { NextResponse } from 'next/server';
import fetch from "node-fetch"; // Untuk mengunduh file dari URL
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { GoogleAIFileManager } = require("@google/generative-ai/server");
const fs = require('fs'); // Untuk menyimpan file lokal
const path = require('path');
// API Key untuk Gemini
const apiKey = 'AIzaSyBPzp-ALBhPcSsQUyUb_IseKa-wN504RUE'; 
const genAI = new GoogleGenerativeAI(apiKey);
const fileManager = new GoogleAIFileManager(apiKey);

export const dynamic = "force-static";

// Fungsi untuk mengunduh file dari URL dan menyimpannya secara lokal
async function downloadFile(url: any, outputPath: any) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch the file');
    }

    const buffer = await response.buffer();
    fs.writeFileSync(outputPath, buffer); // Simpan ke lokal
    console.log(`File downloaded and saved to ${outputPath}`);
    return outputPath; // Kembalikan path file lokal
  } catch (error) {
    console.error('Error downloading file:', error);
    throw error;
  }
}

// Fungsi untuk mengunggah file ke Gemini
async function uploadToGemini(path: any, mimeType: any) {
  const uploadResult = await fileManager.uploadFile(path, {
    mimeType,
    displayName: path,
  });
  const file = uploadResult.file;
  console.log(`Uploaded file ${file.displayName} as: ${file.name}`);
  return file;
}


const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash-exp",
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

export async function POST(request: any) {
  try {
    const { fileUrl, jobDescription } = await request.json();

    // Tentukan path untuk menyimpan file secara lokal
    const outputPath = './downloaded_file'; // Anda bisa mengganti path sesuai kebutuhan

    // Unduh file dari URL dan simpan secara lokal
    const downloadedFilePath = await downloadFile(fileUrl, outputPath);

    // Unggah file yang sudah diunduh ke Gemini
    const mimeTypes: any = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.pdf': 'application/pdf',
      '.webp': 'image/webp'
      // Tambahkan ekstensi lainnya sesuai kebutuhan
    };
    
    const extname = path.extname(fileUrl).toLowerCase();
    const mimeType = mimeTypes[extname] || 'application/octet-stream';
    console.log('ext', extname)
    const files = await uploadToGemini(downloadedFilePath, mimeType);

    // Run Generative AI Model untuk menganalisis CV
    const chatSession = model.startChat({
      generationConfig,
      history: [
        {
          role: "user",
          parts: [
            // {text: "Kamu adalah seorang CV Analyst dan CV Optimizer yang bertugas untuk:\n\nMenganalisis CV yang diberikan pengguna terhadap requirement lowongan pekerjaan tertentu.\nMemberikan hasil analisis dalam bentuk JSON yang berisi:\nKecocokan dengan pekerjaan tersebut: Penilaian terhadap bagaimana CV memenuhi kriteria lowongan.\nSkor kecocokan: Dalam rentang 0-100 berdasarkan analisis terhadap requirement lowongan.\nSaran pembelajaran atau perbaikan: Rekomendasi skill, pengalaman, atau informasi yang perlu ditingkatkan sesuai dengan lowongan.\nSaran CV baru: Contoh CV yang dioptimalkan untuk lowongan pekerjaan tersebut.\nPerbaikan yang diperlukan: Detail perubahan pada bagian CV yang perlu disesuaikan dengan lowongan pekerjaan.\nMemberikan hasil dalam format yang bisa digunakan untuk membuat file PDF dengan React.\nInput\nBerikan dua input berikut:\n\nCV dalam format teks: Data CV yang akan dianalisis.\nRequirement pekerjaan: Deskripsi lowongan pekerjaan yang menjadi referensi.\nOutput JSON\nHasil analisis berupa JSON seperti ini:\n\njson\nCopy code\n{\n  \"job_match\": {\n    \"compatibility_score\": 85,\n    \"summary\": \"CV cukup sesuai dengan requirement pekerjaan, namun perlu perbaikan dalam bagian pengalaman kerja dan skill.\"\n  },\n  \"recommendations\": {\n    \"skills_to_learn\": [\"Python\", \"Data Analysis\"],\n    \"experiences_to_gain\": [\"Project management\"],\n    \"improvements_needed\": [\"Deskripsi pencapaian lebih terukur\", \"Tambahkan pengalaman terkait langsung dengan bidang pekerjaan.\"]\n  },\n  \"optimized_cv\": {\n    \"name\": \"John Doe\",\n    \"contact_info\": [{type: \"email\", value:\"email@example.com\"}, {type: \"phone\",value:\"+123456789\"}]\n    \"summary\": \"Professional software engineer with 5+ years of experience in developing scalable web applications...\",\n    \"work_experience\": [\n      {\n        \"title\": \"Software Developer\",\n        \"company\": \"TechCorp\",\n        \"duration\": \"2018 - Present\",\n        \"achievements\": [\n          \"Led a team to develop a high-traffic eCommerce platform that increased sales by 30%.\",\n          \"Optimized legacy systems to improve processing speed by 40%.\"\n        ]\n      }\n    ],\n    \"education\": [\n      {\n        \"degree\": \"B.Sc. in Computer Science\",\n        \"university\": \"Tech University\",\n        \"graduation_year\": 2017\n      }\n    ],\n    \"skills\": [\"JavaScript\", \"React\", \"Node.js\", \"SQL\", \"Team Leadership\"]\n  }\n}\nLangkah untuk Format PDF dengan React\nPastikan semua perbaikan ditampilkan dengan jelas untuk setiap bagian.\nStruktur hasil diubah menjadi tabel atau bagian terpisah yang mudah dibaca saat di-render ke PDF."},
            // {text: "Kamu adalah seorang CV Analyst dan CV Optimizer yang bertugas untuk:\n\nMenganalisis CV yang diberikan pengguna terhadap requirement lowongan pekerjaan tertentu.\nMemberikan hasil analisis dalam bentuk JSON yang berisi:\nKecocokan dengan pekerjaan tersebut: Penilaian terhadap bagaimana CV memenuhi kriteria lowongan.\nSkor kecocokan: Dalam rentang 0-100 berdasarkan analisis terhadap requirement lowongan.\nSaran pembelajaran atau perbaikan: Rekomendasi skill, pengalaman, atau informasi yang perlu ditingkatkan sesuai dengan lowongan.\nSaran CV baru:berikan Contoh CV yang dioptimalkan untuk lowongan pekerjaan tersebut dari cv lama user dan perbaiki kata-kata yang perlu diperbaiki dari cvnya.\nKemungkinan Pertanyaan ketika Interview: berikan beberapa pertanyaan yang mungkin akan ditanyakan oleh user ketika interview berdasarkan job requirement.\nMemberikan hasil dalam format yang bisa digunakan untuk membuat file PDF dengan React.\nInput\nBerikan dua input berikut:\n\nCV dalam format teks: Data CV yang akan dianalisis.\nRequirement pekerjaan: Deskripsi lowongan pekerjaan yang menjadi referensi.\nOutput JSON\nHasil analisis berupa JSON seperti ini:\n\njson\nCopy code\n{\n  \"job_match\": {\n    \"compatibility_score\": 85,\n    \"summary\": \"CV cukup sesuai dengan requirement pekerjaan, namun perlu perbaikan dalam bagian pengalaman kerja dan skill.\"\n  },\n  \"recommendations\": {\n    \"skills_to_learn\": [\"Python\", \"Data Analysis\"],\n    \"experiences_to_gain\": [\"Project management\"],\n    \"improvements_needed\": [\"Deskripsi pencapaian lebih terukur\", \"Tambahkan pengalaman terkait langsung dengan bidang pekerjaan.\"]\n  },\n  \"optimized_cv\": {\n    \"name\": \"John Doe\",\n    \"contact_info\": [{type: \"email\", value:\"email@example.com\"}, {type: \"phone\",value:\"+123456789\"}]\n    \"summary\": \"Professional software engineer with 5+ years of experience in developing scalable web applications...\",\n    \"work_experience\": [\n      {\n        \"title\": \"Software Developer\",\n        \"company\": \"TechCorp\",\n        \"duration\": \"2018 - Present\",\n        \"achievements\": [\n          \"Led a team to develop a high-traffic eCommerce platform that increased sales by 30%.\",\n          \"Optimized legacy systems to improve processing speed by 40%.\"\n        ]\n      }\n    ],\n    \"education\": [\n      {\n        \"degree\": \"B.Sc. in Computer Science\",\n        \"university\": \"Tech University\",\n        \"graduation_year\": 2017\n      }\n    ],\n    \"skills\": [\"JavaScript\", \"React\", \"Node.js\", \"SQL\", \"Team Leadership\"]\n  }\n}\nLangkah untuk Format PDF dengan React\nPastikan semua perbaikan ditampilkan dengan jelas untuk setiap bagian.\nStruktur hasil diubah menjadi tabel atau bagian terpisah yang mudah dibaca saat di-render ke PDF."},
            // {text: "Kamu adalah seorang CV Analyst dan CV Optimizer yang bertugas untuk:\n\nMenganalisis CV yang diberikan pengguna terhadap requirement lowongan pekerjaan tertentu.\nMemberikan hasil analisis dalam bentuk JSON yang berisi:\nKecocokan dengan pekerjaan tersebut: Penilaian terhadap bagaimana CV memenuhi kriteria lowongan.\nSkor kecocokan: Dalam rentang 0-100 berdasarkan analisis terhadap requirement lowongan.\nSaran pembelajaran atau perbaikan: Rekomendasi skill, pengalaman, atau informasi yang perlu ditingkatkan sesuai dengan lowongan.\nSaran CV baru:berikan Contoh CV yang dioptimalkan untuk lowongan pekerjaan tersebut dari cv lama user dan improve kata-kata yang perlu di pengalaman kerjanya dan lain-lain.\nKemungkinan Pertanyaan ketika Interview: berikan beberapa pertanyaan yang mungkin akan ditanyakan oleh user ketika interview berdasarkan job requirement.\nMemberikan hasil dalam format yang bisa digunakan untuk membuat file PDF dengan React.\nInput\nBerikan dua input berikut:\n\nCV dalam format teks: Data CV yang akan dianalisis.\nRequirement pekerjaan: Deskripsi lowongan pekerjaan yang menjadi referensi.\nOutput JSON\nHasil analisis berupa JSON seperti ini:\n\njson\nCopy code\n{\n  \"job_match\": {\n    \"compatibility_score\": 85,\n    \"summary\": \"CV cukup sesuai dengan requirement pekerjaan, namun perlu perbaikan dalam bagian pengalaman kerja dan skill.\"\n  },\n  \"recommendations\": {\n    \"skills_to_learn\": [\"Python\", \"Data Analysis\"],\n    \"experiences_to_gain\": [\"Project management\"],\n    \"improvements_needed\": [\"Deskripsi pencapaian lebih terukur\", \"Tambahkan pengalaman terkait langsung dengan bidang pekerjaan.\"]\n  },\n  \"optimized_cv\": {\n    \"name\": \"John Doe\",\n    \"contact_info\": [{type: \"email\", value:\"email@example.com\"}, {type: \"phone\",value:\"+123456789\"}]\n    \"summary\": \"Professional software engineer with 5+ years of experience in developing scalable web applications...\",\n    \"work_experience\": [\n      {\n        \"title\": \"Software Developer\",\n        \"company\": \"TechCorp\",\n        \"duration\": \"2018 - Present\",\n        \"achievements\": [\n          \"Led a team to develop a high-traffic eCommerce platform that increased sales by 30%.\",\n          \"Optimized legacy systems to improve processing speed by 40%.\"\n        ]\n      }\n    ],\n    \"education\": [\n      {\n        \"degree\": \"B.Sc. in Computer Science\",\n        \"university\": \"Tech University\",\n        \"graduation_year\": 2017\n      }\n    ],\n    \"skills\": [\"JavaScript\", \"React\", \"Node.js\", \"SQL\", \"Team Leadership\"]\n  }\n}\nLangkah untuk Format PDF dengan React\nPastikan semua perbaikan ditampilkan dengan jelas untuk setiap bagian.\nStruktur hasil diubah menjadi tabel atau bagian terpisah yang mudah dibaca saat di-render ke PDF."},
            {text: "Kamu adalah seorang CV Analyst dan CV Optimizer yang bertugas untuk:\n\nMenganalisis CV yang diberikan pengguna terhadap requirement lowongan pekerjaan tertentu.\nMemberikan hasil analisis dalam bentuk JSON yang berisi:\nKecocokan dengan pekerjaan tersebut: Penilaian terhadap bagaimana CV memenuhi kriteria lowongan.\nSkor kecocokan: Dalam rentang 0-100 berdasarkan analisis terhadap requirement lowongan.\nSaran pembelajaran atau perbaikan: Rekomendasi skill, pengalaman, atau informasi yang perlu ditingkatkan sesuai dengan lowongan.\nSaran CV baru:berikan Contoh CV yang dioptimalkan untuk lowongan pekerjaan tersebut dari cv lama user dan improve kata-kata yang perlu di pengalaman kerjanya dan lain-lain.\nKemungkinan Pertanyaan ketika Interview: berikan beberapa pertanyaan yang mungkin akan ditanyakan oleh user ketika interview berdasarkan job requirement.\nMemberikan hasil dalam format yang bisa digunakan untuk membuat file PDF dengan React.\nInput\nBerikan dua input berikut:\n\nCV dalam format teks: Data CV yang akan dianalisis.\nRequirement pekerjaan: Deskripsi lowongan pekerjaan yang menjadi referensi.\nOutput JSON\nHasil analisis berupa JSON seperti ini:\n\njson\nCopy code\n{\n  \"job_match\": {\n    \"compatibility_score\": 85,\n    \"summary\": \"CV cukup sesuai dengan requirement pekerjaan, namun perlu perbaikan dalam bagian pengalaman kerja dan skill.\"\n  },\n  \"recommendations\": {\n    \"skills_to_learn\": [\"Python\", \"Data Analysis\"],\n    \"experiences_to_gain\": [\"Project management\"],\n    \"improvements_needed\": [\"Deskripsi pencapaian lebih terukur\", \"Tambahkan pengalaman terkait langsung dengan bidang pekerjaan.\"]\n  },\n  \"optimized_cv\": {\n    \"name\": \"John Doe\",\n    \"contact_info\": [{type: \"email\", value:\"email@example.com\"}, {type: \"phone\",value:\"+123456789\"}]\n    \"summary\": \"Professional software engineer with 5+ years of experience in developing scalable web applications...\",\n    \"work_experience\": [\n      {\n        \"title\": \"Software Developer\",\n        \"company\": \"TechCorp\",\n        \"duration\": \"2018 - Present\",\n        \"achievements\": [\n          \"Led a team to develop a high-traffic eCommerce platform that increased sales by 30%.\",\n          \"Optimized legacy systems to improve processing speed by 40%.\"\n        ]\n      }\n    ],\n    \"education\": [\n      {\n        \"degree\": \"B.Sc. in Computer Science\",\n        \"university\": \"Tech University\",\n        \"graduation_year\": 2017\n      }\n    ],\n    \"skills\": [\"JavaScript\", \"React\", \"Node.js\", \"SQL\", \"Team Leadership\"],\n   \"organization\": [\n                {\n                    \"name\": \"Himpunan Mahasiswa Sistem Informasi (HIMSISFO)\",\n                    \"division\": \"Contributor Information Division\",\n                    \"duration\": \"2014-2016\"\n                }\n            ]\n  },\n  \"interview_questions\": [\n            \"Can you describe your experience with React.js and how you've used it in your previous projects?\",\n            \"Tell me about your experience with Next.js, particularly with server-side rendering (SSR) and static site generation (SSG).\",\n            \"How do you handle state management in React applications, and have you worked with Redux or Context API?\",\n            \"Describe your experience working with RESTful APIs in React/Next.js projects.\",\n            \"How do you ensure cross-browser compatibility in your web applications?\",\n            \"What version control systems are you familiar with, and how have you used them?\",\n            \"Give an example of a challenging frontend problem you encountered and how you resolved it.\",\n            \"How do you stay up-to-date with the latest web development trends and technologies?\",\n            \"How do you approach debugging in React/Next.js?\",\n            \"Can you describe a situation where you worked as a team to accomplish a goal, and what was your role and contribution?\"\n        ]\n}\nLangkah untuk Format PDF dengan React\nPastikan semua perbaikan ditampilkan dengan jelas untuk setiap bagian.\nStruktur hasil diubah menjadi tabel atau bagian terpisah yang mudah dibaca saat di-render ke PDF."},
            {
              fileData: {
                mimeType: files.mimeType,
                fileUri: files.uri,
              },
            },
          ]
        }
      ]
    });

    const response = await chatSession.sendMessage(`tolong analisis cv yang saya upload ini dengan requirement : ${jobDescription} \n`);
    const analysisResult = response.response.text()

    const regex = /```json\n([\s\S]*?)```/;
    const match = analysisResult.match(regex);
    let analysis_json = {};
    if (match) {
      try {
          // Parse hasil ekstraksi ke dalam JSON
          analysis_json = JSON.parse(match[1]);
      } catch (error) {
          console.error("Error parsing JSON:", error);
          return {
              error: "Gagal memparsing hasil analisis CV"
          };
      }
    } else {
      analysis_json = {};
    }

    // Return analysis result
    return NextResponse.json({
      analysis: analysis_json,
    });

  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: 'Failed to analyze CV' },
      { status: 500 }
    );
  }
}



// import { NextResponse } from 'next/server';
// const { GoogleGenerativeAI } = require("@google/generative-ai");
// const { GoogleAIFileManager } = require("@google/generative-ai/server");

// // const apiKey = process.env.GEMINI_API_KEY;
// const apiKey = 'AIzaSyBPzp-ALBhPcSsQUyUb_IseKa-wN504RUE'; 
// const genAI = new GoogleGenerativeAI(apiKey);
// const fileManager = new GoogleAIFileManager(apiKey);
// export const dynamic = "force-static";

// /**
//  * Uploads the given file to Gemini.
//  */
// async function uploadToGemini(path, mimeType) {
//   const uploadResult = await fileManager.uploadFile(path, {
//     mimeType,
//     displayName: path,
//   });
//   const file = uploadResult.file;
//   console.log(`Uploaded file ${file.displayName} as: ${file.name}`);
//   return file;
// }

// const model = genAI.getGenerativeModel({
//   model: "gemini-2.0-flash-exp",
// });

// const generationConfig = {
//   temperature: 1,
//   topP: 0.95,
//   topK: 40,
//   maxOutputTokens: 8192,
//   responseMimeType: "text/plain",
// };

// export async function POST(request: any) {
//   try {
//     const { fileUrl, jobDescription } = await request.json();

//     // Upload file to Gemini
//     const file = await uploadToGemini(fileUrl, "image/webp");

//     // Run Generative AI Model to analyze the CV
//     const chatSession = model.startChat({
//       generationConfig,
//       history: [
//         {
//           role: "user",
//           parts: [
//             { text: "Kamu adalah seorang CV Analyst yang bertugas untuk menganalisis CV berdasarkan lowongan pekerjaan..." },
//             { text: `CV: ${fileUrl}` },
//             { text: `Job Description: ${jobDescription}` }
//           ]
//         }
//       ]
//     });

//     const response = await chatSession.run();
//     const analysisResult = response.modelResponse[0].parts[0].text;

//     // Mock Response (for now)
//     const mockAnalysis = {
//       match_percentage: 75,
//       skills_found: ["JavaScript", "React", "TypeScript"],
//       missing_skills: ["Python", "AWS"],
//       recommendations: [
//         "Consider adding more detail about your cloud experience",
//         "Highlight any Python projects you've worked on"
//       ]
//     };

//     // Return analysis result
//     return NextResponse.json({
//       analysis: analysisResult,
//       mockAnalysis
//     });

//   } catch (error) {
//     console.log(error);
//     return NextResponse.json(
//       { error: 'Failed to analyze CV' },
//       { status: 500 }
//     );
//   }
// }


// import { NextResponse } from 'next/server';

// export async function POST(request: Request) {
//   try {
//     const { fileUrl, jobDescription } = await request.json();

//     // Here you would implement your CV analysis logic
//     // For now, we'll return a mock response
//     const mockAnalysis = {
//       match_percentage: 75,
//       skills_found: ["JavaScript", "React", "TypeScript"],
//       missing_skills: ["Python", "AWS"],
//       recommendations: [
//         "Consider adding more detail about your cloud experience",
//         "Highlight any Python projects you've worked on"
//       ]
//     };

//     return NextResponse.json(mockAnalysis);
//   } catch (error) {
//     console.log(error)
//     return NextResponse.json(
//       { error: 'Failed to analyze CV' },
//       { status: 500 }
//     );
//   }
// }