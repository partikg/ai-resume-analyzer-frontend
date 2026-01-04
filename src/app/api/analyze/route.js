import * as pdfParse from "pdf-parse";

export const runtime = "nodejs";

export async function POST(req) {
    try {
        const body = await req.json();
        const { resumeBase64, jd, company, jobTitle } = body;

        if (!resumeBase64) {
            return new Response(
                JSON.stringify({ error: "Resume missing" }),
                { status: 400 }
            );
        }

        // Convert base64 → buffer
        const buffer = Buffer.from(resumeBase64, "base64");

        const data = await pdfParse(buffer);
        const resumeText = data.text.toLowerCase();
        const jdText = jd.toLowerCase();

        // SIMPLE DEMO RESPONSE (for testing)
        return new Response(
            JSON.stringify({
                atsScore: 68,
                skillsScore: 55,
                contentScore: 72,
                structureScore: 80,
                toneScore: 65,
                overallScore: 63,
                matchedSkills: ["Python"],
                missingSkills: ["SQL", "Node.js"],
                resumeskills: ["Python"],
                jobskills: ["Python", "SQL", "Node.js"],
                improvements: [
                    "Add SQL to skills section",
                    "Use more action verbs",
                ],
            }),
            { status: 200 }
        );
    } catch (err) {
        return new Response(
            JSON.stringify({ error: err.message }),
            { status: 500 }
        );
    }
}
