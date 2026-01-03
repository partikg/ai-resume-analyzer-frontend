'use client'
import axios from "axios";
import { useState } from "react";

export default function Home() {

  const [resume, setResume] = useState(null)
  const [jd, setJd] = useState("")
  const [result, setResult] = useState(null)
  const [pdfUrl, setPdfUrl] = useState(null);
  const [company, setCompany] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [loading, setLoading] = useState(false)

  const submitHandler = async (e) => {
    e.preventDefault()

    setLoading(true)

    const formData = new FormData()
    formData.append("resume", resume)
    formData.append("jd", jd)
    formData.append("company", company)
    formData.append("jobTitle", jobTitle)

    axios.post('http://localhost:3000/api/resume/upload', formData)
      .then((res) => {
        setResult(res.data)
        setPdfUrl(res.data.pdfUrl);
        setLoading(false)
        console.log(res.data)
      })
      .catch((error) => {
        setLoading(false)
        console.log(error)
      })

  }

  const getLabel = (score) => {
    if (score >= 75) {
      return "Good";
    }
    else if (score >= 50) {
      return "Average";
    }
    else {
      return "Poor"
    }
  }


  return (
    <>
      <div className="flex-1 justify-items-center">

        <div className="w-full max-w-4xl border-2">

          <form onSubmit={submitHandler} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">

            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="companyname">
                Company Name
              </label>
              <input
                className="border-2"
                placeholder="give company name"
                onChange={(e) => setCompany(e.target.value)}
              ></input>
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="jobtitle">
                Job Title
              </label>
              <input
                className="border-2"
                placeholder="give job title"
                onChange={(e) => setJobTitle(e.target.value)}
              ></input>
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="jd">
                Job Description
              </label>
              <textarea
                className="border-2"
                placeholder="Paste job description"
                onChange={(e) => setJd(e.target.value)}
              ></textarea>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="resume">
                Upload resume file
              </label>
              <input
                className="border-2"
                type="file"
                onChange={(e) => setResume(e.target.files[0])}
              />
            </div>

            <div className="flex items-center justify-between">
              <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="submit" disabled={loading}>
                {loading ? "Analyzing..." : "Analyze"}
              </button>
            </div>
          </form>


          {/* result */}
          {result && (

            // left side
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">

              <div className="border rounded-lg p-3 bg-white">
                <iframe
                  src={pdfUrl}
                  className="w-full h-[500px] border"
                />
              </div>

              {/* right side */}
              <div className="rounded-lg p-6">

                <h2 className="font-extrabold text-3xl mb-4">Resume Analysis</h2>

                <div className="text-center mb-6">
                  <p className="text-gray-500">Overall Resume Score</p>
                  <p className="text-5xl font-bold">
                    {result.overallScore}%
                  </p>
                </div>

                <div className="space-y-2">
                  <p><b>Tone and Style:</b> {result.toneScore}/100 ({getLabel(result.toneScore)})</p>

                  <p><b>content:</b> {result.contentScore}/100 ({getLabel(result.contentScore)})</p>

                  <p><b>structure:</b> {result.structureScore}/100 ({getLabel(result.structureScore)})</p>

                  <p><b>skills:</b> {result.skillsScore}/100 ({getLabel(result.skillsScore)})</p>
                </div>

                <div className="mt-3 mb-4 p-2 border">
                  <span className="font-semibold">ATS Score: </span>
                  <span className="text-xl font-bold">
                    {result.atsScore}%
                  </span>
                </div>

                <h6 className="font-semibold">Needs Improvement:</h6>
                <ul className="list-disc text-sm pl-5 text-gray-700">
                  {result.improvements.map(imp => (
                    <li key={imp}>{imp}</li>
                  ))}
                </ul>


                {/* resume details */}
                <div className="mt-6 text-sm">

                  <div>
                    <p className="mt-2"><b>Matched Skills:</b></p>
                    <ul>
                      {result.matchedSkills.map(skill => (
                        <li key={skill}>{skill}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <p className="mt-2"><b>Missing Skills:</b></p>
                    <ul>
                      {result.missingSkills.map(skill => (
                        <li key={skill}>{skill}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <p className="mt-2"><b>Job Required Skills:</b></p>
                    <ul>
                      {result.jobskills.map(skill => (
                        <li key={skill}> {skill}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <p className="mt-2"><b>Skills Found in Resume:</b></p>
                    <ul>
                      {result.resumeskills.map(skill => (
                        <li key={skill}> {skill}</li>
                      ))}
                    </ul>
                  </div>

                </div>

              </div>

            </div>
          )}

        </div>

      </div>
    </>
  );
}
