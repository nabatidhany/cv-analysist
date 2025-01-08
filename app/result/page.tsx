"use client";
import { useResultStore } from "@/store/resultStore";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
// import html2pdf from 'html2pdf.js/dist/html2pdf.min';
import ReactDOMServer from 'react-dom/server';
import Link from "next/link";
import { MoveLeft } from "lucide-react";


export default function Result() {
  const result = useResultStore((state) => state.result);
  const clearResult = useResultStore((state) => state.clearResult);
  const router = useRouter();
  const analysis = result?.analysis || {}; // Tambahkan fallback untuk analysis
  const {
    job_match = {},
    recommendations = {},
    optimized_cv = null,
    interview_questions = [],
  } = analysis; // Pastikan nilai default ada jika tidak tersedia
  useEffect(() => {
    // Jika tidak ada data, kembali ke halaman sebelumnya
    if (!result) {
      router.push("/");
    }
  }, [result, router]);

  if (!result) {
    return <p>Redirecting...</p>; // Fallback jika data tidak tersedia
  }

  const renderList = (items: any) => {
    if (!items || items.length === 0) {
      return <p className="text-gray-500">Data tidak tersedia.</p>;
    }
    return (
      <ul className="list-disc pl-5">
        {items.map((item: any, index: any) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    );
  };

  const pdfJSX = (datax: any) => {
    const {
      name,
      contact_info = [],
      summary,
      work_experience = [],
      education = [],
      skills = [],
      organization = []
    } = datax;
  
    const renderContactInfo = (contacts: any) => (
      <div>
        {contacts.map((contact: any, index: any) => (
          <p key={index}>{contact.type}: {contact.value}</p>
        ))}
      </div>
    );
  
    const renderWorkExperience = (experiences: any) => (
      <div>
        {experiences?.map((experience: any, index: any) => (
          <div key={index} style={{ marginBottom: "1rem" }}>
            <p style={{ fontSize: "0.8rem", color: "gray" }}>{experience.duration}</p>
            <p><strong>{experience.title}</strong>, {experience.company}</p>
            <ul>
              {experience.achievements.map((achievement: any, idx: any) => (
                <li style={{ fontSize: "0.9rem" }} key={idx}>{achievement.text || achievement}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    );
  
    const renderEducation = (educations: any) => (
      <div>
        {educations.map((edu: any, index: any) => (
          <p key={index}>
            🎓 {edu.degree}, {edu.university} ({edu.graduation_year})
          </p>
        ))}
      </div>
    );
  
    const renderSkills = (skills: any) => {
      return(
        <ul>
          {skills.map((skill: any, index: any) => (
            <li key={index}>🎖 {skill.text || skill}</li>
          ))}
        </ul>
      )
    };
  
    const renderOrganizations = (orgs: any) => (
      <div>
        {orgs.map((org: any, index: any) => (
          <p key={index}>
            💼 {org.name} ({org.division}) - {org.duration}
          </p>
        ))}
      </div>
    );
  
    return (
      <>
        <div style={{ fontFamily: "Arial, sans-serif", paddingRight: "40px", paddingLeft: "40px" }}>
          <header style={{ textAlign: "left", marginBottom: "2rem" }}>
            <h1 style={{ textTransform: "uppercase", margin: 0, fontSize: "2rem", marginBottom: "1rem" }}>{name}</h1>
            <p style={{ fontSize: "1rem", color: "gray" }}>{summary}</p>
          </header>
          <hr />
          <section style={{ marginBottom: "2rem" }}>
            {/* <h2>Contact</h2> */}
            {renderContactInfo(contact_info)}
          </section>
          <hr style={{marginBottom: "1rem"}} />
          {work_experience.length > 0 && (
            <section style={{ marginBottom: "2rem" }}>
              <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem"}}><strong>EXPERIENCE</strong></h2>
              {renderWorkExperience(work_experience)}
            </section>
          )}
    
          {education.length > 0 && (
            <section style={{ marginBottom: "2rem" }}>
              <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem"}}><strong>EDUCATION</strong></h2>
              {renderEducation(education)}
            </section>
          )}

          {Array.isArray(skills) && skills.length > 0 && (
            <section style={{ marginBottom: "2rem" }}>
              <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}><strong>SKILLS</strong></h2>
              {renderSkills(skills)}
            </section>
          )}

          {typeof skills === "object" && skills !== null && !Array.isArray(skills) && Object.keys(skills).length > 0 && (
            <section style={{ marginBottom: "2rem" }}>
              <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem", marginTop: "1rem" }}><strong>SKILLS</strong></h2>
              {Object.keys(skills).map((key) => (
                <div key={key}>
                  <h3 className="capitalize">{key.replace('_', ' ')}: </h3>
                  {renderSkills(skills[key])}
                </div>
              ))}
            </section>
          )}
    
          {/* {skills.length > 0 && (
            <section style={{ marginBottom: "2rem" }}>
              <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem"}}><strong>SKILLS</strong></h2>
              {renderSkills(skills)}
            </section>
          )}
          
          {Object.keys(skills).length > 0 && (
            <>
              <section style={{ marginBottom: "2rem"}}>
                  <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem", marginTop: "1rem"}}><strong>SKILLS</strong></h2>
                  {Object.keys(skills).map((key) => {
                    return (
                      <div key={key}>
                        <h3 className="capitalize">{key.replace('_', ' ')}: </h3>
                        {renderSkills(skills[key])}
                      </div>
                    );
                  })}
              </section>
            </>
          )} */}
    
          {organization.length > 0 && (
            <section style={{ marginBottom: "2rem" }}>
              <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem"}}><strong>ORGANIZATION</strong></h2>
              {renderOrganizations(organization)}
            </section>
          )}
        </div>
      </>
    );
  }

  const printHandler = () => {
    // const printElement = pdfJSX();
    const printElement = ReactDOMServer.renderToString(pdfJSX(optimized_cv));
    // console.log(printElement);
    
    // @ts-ignore
    import('html2pdf.js').then((html2pdf) => {
      html2pdf.default().from(printElement).
      set({
        pagebreak: { mode: 'avoid-all' },
        margin:       [20, 0, 20, 0],
      })
      .save('optimize-cv').then((data: string) => {
        // print the base64 string, call save instead of outputPdf if you just want to save it.    
      });
    });


    // html2pdf().set({
    //   pagebreak: { mode: 'avoid-all' },
    //   margin:       [20, 0, 20, 0],
    // }).from(printElement).save(`optimize-cv.pdf`);

    // html2pdf()
    // .from(printElement)
    // .set({
    //   pagebreak: { mode: 'css', after: '.page-break' }
    // })
    // .save();
    // html2pdf().from(printElement).save();
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold text-indigo-600">
            Analysis Result
          </h1>
          <p className="text-xl text-gray-600">
          </p>
          {/* Compatibility Score */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold">Skor Kecocokan</h2>
            <div className="bg-gray-200 w-full h-4 rounded-md mt-2">
              <div
                className={`${job_match?.compatibility_score > 50 ? 'bg-green-500' : 'bg-red-500'} h-4 rounded-md`}
                style={{ width: `${job_match?.compatibility_score}%` }}
              ></div>
            </div>
            <p className="mt-2">Skor: {job_match?.compatibility_score}%</p>
          </div>
          {/* Summary */}
          <div className="text-left text-sm bg-gray-100 p-4 rounded-md shadow">
            <h2 className="text-xl font-semibold">Summary</h2>
            <p className="mt-2">{job_match?.summary}</p>
          </div>
          {/* Recommendations */}
          <div className="text-left text-sm bg-gray-100 p-4 rounded-md shadow">
            <div className="mb-6 text-left">
              <h2 className="text-xl font-semibold">Rekomendasi</h2>
              <h3 className="text-lg font-medium mt-2">Skills to Learn</h3>
              {renderList(recommendations.skills_to_learn)}
              <h3 className="text-lg font-medium mt-2">Experiences to Gain</h3>
              {renderList(recommendations.experiences_to_gain)}
              <h3 className="text-lg font-medium mt-2">Improvements Needed</h3>
              {renderList(recommendations.improvements_needed)}
            </div>
          </div>
          <div className="text-left text-sm bg-gray-100 p-4 rounded-md shadow">
            <div className="mb-6">
              <h2 className="text-xl font-semibold">Latihan Pertanyaan Wawancara</h2>
              {renderList(interview_questions)}
            </div>
          </div>
          <div className="mt-10">
            <p className="mb-2">PDF CV and sudah berhasil di optimized</p>
            <button
              onClick={printHandler}
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
            >
              Download PDF
            </button>
          </div>
          <div className="mt-6 flex justify-center">
            <Link href={'/'} className="text-blue-600 flex"><MoveLeft className="mr-2 h-6 w-6" /> Kembali</Link>
          </div>
          {/* Tampilkan data tambahan jika ada */}
          {/* <pre className="text-left text-sm bg-gray-100 p-4 rounded-md shadow">
            {JSON.stringify(result, null, 2)}
          </pre> */}
        </div>
      </div>
    </main>
  );
}
