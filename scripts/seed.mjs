import { MongoClient } from "mongodb";
import crypto from "crypto";

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017";
const dbName = process.env.DB_NAME || "tuitora_database";

const teachers = [
  {
    email: "ritu.das@example.com",
    name: "Ritu Das",
    phone: "+919864000001",
    qualification: "MSc",
    subjects: ["Mathematics", "Physics"],
    classes: ["Class 9", "Class 10", "Class 11", "Class 12"],
    experience_years: 8,
    location_area: "Chowkidingee",
    tuition_modes: ["home", "online"],
    fee_per_month: 3500,
    fee_per_hour: 300,
    availability_days: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    availability_time: "5-8pm",
    description:
      "Board specialist for CBSE & SEBA. 8 years of coaching Class 10-12 with 90%+ result track.",
    is_verified: true,
  },
  {
    email: "arup.gogoi@example.com",
    name: "Arup Gogoi",
    phone: "+919864000002",
    qualification: "BEd",
    subjects: ["Assamese", "English", "Social Science"],
    classes: ["Class 5", "Class 6", "Class 7", "Class 8"],
    experience_years: 12,
    location_area: "Naliapool",
    tuition_modes: ["home", "teacher_place"],
    fee_per_month: 2500,
    availability_days: ["Mon", "Wed", "Fri", "Sat"],
    availability_time: "4-7pm",
    description:
      "Experienced middle-school tutor focussing on strong foundations and Assamese literature.",
    is_verified: true,
  },
  {
    email: "priya.sharma@example.com",
    name: "Priya Sharma",
    phone: "+919864000003",
    qualification: "MSc",
    subjects: ["Chemistry", "Biology"],
    classes: ["Class 11", "Class 12", "Competitive Exams"],
    experience_years: 6,
    location_area: "Amolapatty",
    tuition_modes: ["home", "online"],
    fee_per_month: 4500,
    fee_per_hour: 400,
    availability_days: ["Tue", "Thu", "Sat", "Sun"],
    availability_time: "6-9pm",
    description:
      "NEET aspirants coaching with strong lab-based conceptual teaching.",
    is_verified: true,
  },
  {
    email: "rohit.borah@example.com",
    name: "Rohit Borah",
    phone: "+919864000004",
    qualification: "Engineering (BTech)",
    subjects: ["Mathematics", "Computer Science"],
    classes: ["Class 9", "Class 10", "Class 11", "Class 12", "College / BSc"],
    experience_years: 4,
    location_area: "Milan Nagar",
    tuition_modes: ["online", "home"],
    fee_per_month: 3000,
    fee_per_hour: 250,
    availability_days: ["Mon", "Tue", "Wed", "Thu"],
    availability_time: "7-10pm",
    description: "IIT graduate. Loves teaching problem-solving and Python.",
    is_verified: true,
  },
  {
    email: "nirmali.baruah@example.com",
    name: "Nirmali Baruah",
    phone: "+919864000005",
    qualification: "MA",
    subjects: ["English", "Hindi", "History"],
    classes: ["Class 6", "Class 7", "Class 8", "Class 9", "Class 10"],
    experience_years: 15,
    location_area: "Graham Bazar",
    tuition_modes: ["home"],
    fee_per_month: 2800,
    availability_days: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    availability_time: "3-6pm",
    description:
      "Retired school teacher. Now offering home tuition for middle & high school English/History.",
    is_verified: true,
  },
  {
    email: "bikash.tamuli@example.com",
    name: "Bikash Tamuli",
    phone: "+919864000006",
    qualification: "MSc",
    subjects: ["Physics", "Mathematics"],
    classes: ["Class 11", "Class 12", "Competitive Exams"],
    experience_years: 10,
    location_area: "Jalan Nagar",
    tuition_modes: ["teacher_place", "online"],
    fee_per_month: 5000,
    fee_per_hour: 500,
    availability_days: ["Sat", "Sun"],
    availability_time: "9am-6pm (weekends)",
    description: "JEE Mains/Advanced focus. Weekend intensive batches.",
    is_verified: true,
  },
];

async function seed() {
  console.log(`Connecting to MongoDB at ${uri}...`);
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db(dbName);

    console.log("Connected. Seeding teachers...");
    const now = new Date().toISOString();

    for (const t of teachers) {
      const userId = `seed_user_${crypto.randomUUID().slice(0, 8)}`;
      const teacherId = `teacher_${crypto.randomUUID().slice(0, 8)}`;

      await db.collection("users").updateOne(
        { email: t.email },
        {
          $setOnInsert: {
            id: userId,
            clerk_id: userId,
            email: t.email,
            name: t.name,
            phone: t.phone,
            role: "teacher",
            is_blocked: false,
            created_at: now,
          },
        },
        { upsert: true }
      );

      const userDoc = await db.collection("users").findOne({ email: t.email });

      await db.collection("teacher_profiles").updateOne(
        { email: t.email },
        {
          $set: {
            name: t.name,
            qualification: t.qualification,
            subjects: t.subjects,
            classes: t.classes,
            experience_years: t.experience_years,
            location_area: t.location_area,
            tuition_modes: t.tuition_modes,
            fee_per_month: t.fee_per_month,
            fee_per_hour: t.fee_per_hour || null,
            availability_days: t.availability_days,
            availability_time: t.availability_time,
            description: t.description,
            is_verified: t.is_verified,
            is_available: true,
            user_id: userDoc.id,
            email: t.email,
            phone: t.phone,
            updated_at: now,
          },
          $setOnInsert: {
            id: teacherId,
            created_at: now,
          },
        },
        { upsert: true }
      );

      console.log(`- Seeded tutor: ${t.name} (${t.location_area})`);
    }

    // Seed Admin User
    await db.collection("users").updateOne(
      { email: "admin@dibrugarhtuition.in" },
      {
        $setOnInsert: {
          id: "admin_user_seed",
          clerk_id: "admin_user_seed",
          email: "admin@dibrugarhtuition.in",
          name: "Platform Admin",
          phone: "+91-0000000000",
          role: "admin",
          is_blocked: false,
          created_at: now,
        },
      },
      { upsert: true }
    );
    console.log("- Seeded default platform admin");

    console.log("Database seeded successfully!");
  } catch (err) {
    console.error("Seeding error:", err);
  } finally {
    await client.close();
  }
}

seed();
