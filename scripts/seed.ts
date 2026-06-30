/**
 * Run with: npm run seed
 * Populates the database with demo admin, students, faculty, courses, attendance, fees, and enquiries.
 * Safe to re-run — skips collections that already have data.
 */
import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Admin from "../models/Admin";
import Student from "../models/Student";
import Faculty from "../models/Faculty";
import Course from "../models/Course";
import Attendance from "../models/Attendance";
import Fee from "../models/Fee";
import Enquiry from "../models/Enquiry";

function generateReceiptNumber() {
  const year = new Date().getFullYear();
  const random = String(Date.now()).slice(-6);
  return `BFA-${year}-${random}`;
}

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI is not set in .env.local");
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log("Connected to MongoDB");

  // --- Drop stale indexes from old schema versions ---
  // The admins collection previously had a `username` field with unique:true.
  // That field was removed from the schema but the index was never dropped,
  // causing E11000 dup key: { username: null } on every new admin insert.
  try {
    await mongoose.connection.collection("admins").dropIndex("username_1");
    console.log("✓ Dropped stale index: admins.username_1");
  } catch {
    // IndexNotFound — already clean, nothing to do
  }

  // --- Admin ---
  const existingAdmin = await Admin.findOne({ email: "admin@brightfuture.com" });
  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash("Admin@123", 10);
    await Admin.create({ name: "Admin", email: "admin@brightfuture.com", password: hashedPassword, role: "superadmin" });
    console.log("✓ Admin created — admin@brightfuture.com / Admin@123");
  } else {
    console.log("- Admin already exists, skipping");
  }

  // --- Faculty ---
  let faculty;
  if ((await Faculty.countDocuments()) === 0) {
    faculty = await Faculty.insertMany([
      { name: "Mr. Rajesh Kumar", qualification: "M.Sc. Mathematics", subjects: ["Mathematics", "Applied Mathematics"], experience: 12, phone: "9876543001", email: "rajesh.kumar@brightfuture.com", bio: "Specializes in calculus and coordinate geometry for board exam preparation." },
      { name: "Mrs. Priya Sharma", qualification: "M.Sc. Physics", subjects: ["Physics", "Practical Physics"], experience: 8, phone: "9876543002", email: "priya.sharma@brightfuture.com", bio: "Focuses on conceptual clarity through demonstration-based teaching." },
      { name: "Mr. Arvind Singh", qualification: "M.Sc. Chemistry", subjects: ["Chemistry", "Organic Chemistry"], experience: 10, phone: "9876543003", email: "arvind.singh@brightfuture.com", bio: "Known for simplifying organic reaction mechanisms." },
      { name: "Mrs. Neha Verma", qualification: "M.Com", subjects: ["Accountancy", "Business Studies"], experience: 7, phone: "9876543004", email: "neha.verma@brightfuture.com", bio: "Expert in commerce stream with a strong record of board toppers." },
    ]);
    console.log(`✓ ${faculty.length} faculty members created`);
  } else {
    faculty = await Faculty.find();
    console.log("- Faculty already exist, skipping");
  }

  // --- Courses ---
  if ((await Course.countDocuments()) === 0) {
    const courses = await Course.insertMany([
      { name: "Science (PCM)", class: "XI & XII", stream: "Science", subjects: ["Physics", "Chemistry", "Mathematics"], duration: "2 Years", fee: 60000, description: "Comprehensive PCM coaching with weekly tests and doubt-clearing sessions." },
      { name: "Science (PCB)", class: "XI & XII", stream: "Science", subjects: ["Physics", "Chemistry", "Biology"], duration: "2 Years", fee: 62000, description: "Medical entrance focused PCB program with lab-based learning." },
      { name: "Commerce", class: "XI & XII", stream: "Commerce", subjects: ["Accountancy", "Business Studies", "Economics"], duration: "2 Years", fee: 45000, description: "Complete commerce stream coaching with case-study based teaching." },
      { name: "Arts", class: "XI & XII", stream: "Arts", subjects: ["History", "Political Science", "Geography"], duration: "2 Years", fee: 38000, description: "Humanities coaching with essay writing and analytical skill building." },
    ]);
    console.log(`✓ ${courses.length} courses created`);
  } else {
    console.log("- Courses already exist, skipping");
  }

  // --- Students ---
  let students;
  if ((await Student.countDocuments()) === 0) {
    students = await Student.insertMany([
      { rollNo: "101", name: "Aarav Sharma", class: "XI Science", subjects: ["Physics", "Chemistry", "Mathematics"], phone: "9876543210", parentPhone: "9876500001", address: "Sri Vijaya Puram, Andaman", totalFee: 60000, feesPaid: 40000 },
      { rollNo: "102", name: "Riya Verma", class: "XI Science", subjects: ["Physics", "Chemistry", "Biology"], phone: "9876543211", parentPhone: "9876500002", address: "Sri Vijaya Puram, Andaman", totalFee: 62000, feesPaid: 62000 },
      { rollNo: "103", name: "Sohan Patel", class: "XI Science", subjects: ["Physics", "Chemistry", "Mathematics"], phone: "9876543212", parentPhone: "9876500003", address: "Sri Vijaya Puram, Andaman", totalFee: 60000, feesPaid: 20000 },
      { rollNo: "104", name: "Ananya Singh", class: "XI Science", subjects: ["Physics", "Chemistry", "Biology"], phone: "9876543213", parentPhone: "9876500004", address: "Sri Vijaya Puram, Andaman", totalFee: 62000, feesPaid: 62000 },
      { rollNo: "105", name: "Karan Mehta", class: "XI Science", subjects: ["Physics", "Chemistry", "Mathematics"], phone: "9876543214", parentPhone: "9876500005", address: "Sri Vijaya Puram, Andaman", totalFee: 60000, feesPaid: 30000 },
      { rollNo: "106", name: "Ishita Gupta", class: "XI Science", subjects: ["Physics", "Chemistry", "Biology"], phone: "9876543215", parentPhone: "9876500006", address: "Sri Vijaya Puram, Andaman", totalFee: 62000, feesPaid: 50000 },
      { rollNo: "107", name: "Aditya Raj", class: "XI Science", subjects: ["Physics", "Chemistry", "Mathematics"], phone: "9876543216", parentPhone: "9876500007", address: "Sri Vijaya Puram, Andaman", totalFee: 60000, feesPaid: 60000 },
      { rollNo: "108", name: "Neha Kumari", class: "XI Science", subjects: ["Physics", "Chemistry", "Biology"], phone: "9876543217", parentPhone: "9876500008", address: "Sri Vijaya Puram, Andaman", totalFee: 62000, feesPaid: 31000 },
      { rollNo: "201", name: "Rohan Kumar", class: "XI Science", subjects: ["Physics", "Chemistry", "Mathematics"], phone: "9876543220", parentPhone: "9876500009", address: "Garacharma, Andaman", totalFee: 60000, feesPaid: 60000 },
      { rollNo: "202", name: "Priya Sharma", class: "XII Commerce", subjects: ["Accountancy", "Business Studies", "Economics"], phone: "9876543221", parentPhone: "9876500010", address: "Garacharma, Andaman", totalFee: 45000, feesPaid: 27000 },
      { rollNo: "203", name: "Ananya Verma", class: "XI Science", subjects: ["Physics", "Chemistry", "Biology"], phone: "9876543222", parentPhone: "9876500011", address: "Garacharma, Andaman", totalFee: 62000, feesPaid: 62000 },
      { rollNo: "204", name: "Karthik R", class: "XI Science", subjects: ["Physics", "Chemistry", "Mathematics"], phone: "9876543223", parentPhone: "9876500012", address: "Garacharma, Andaman", totalFee: 60000, feesPaid: 15000 },
      { rollNo: "301", name: "Amarishan", class: "XII Science", subjects: ["Physics", "Chemistry", "Mathematics"], phone: "9876543218", parentPhone: "9876500013", address: "Sri Vijaya Puram, Andaman", totalFee: 20000, feesPaid: 18000 },
      { rollNo: "302", name: "Divya Nair", class: "XII Science", subjects: ["Physics", "Chemistry", "Biology"], phone: "9876543219", parentPhone: "9876500014", address: "Sri Vijaya Puram, Andaman", totalFee: 65000, feesPaid: 65000 },
      { rollNo: "303", name: "Vikram Rao", class: "XII Commerce", subjects: ["Accountancy", "Business Studies", "Economics"], phone: "9876543224", parentPhone: "9876500015", address: "Garacharma, Andaman", totalFee: 45000, feesPaid: 22500 },
    ]);
    console.log(`✓ ${students.length} students created`);
  } else {
    students = await Student.find();
    console.log("- Students already exist, skipping");
  }

  // --- Attendance (last 5 weekdays for XI Science) ---
  if ((await Attendance.countDocuments()) === 0) {
    const xiScienceStudents = students.filter((s) => s.class === "XI Science");
    const docs = [];
    for (let i = 0; i < 5; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      docs.push({
        date,
        class: "XI Science",
        records: xiScienceStudents.map((s, idx) => ({
          studentId: s._id,
          status: idx % 5 === 0 ? "absent" : "present",
          remarks: idx % 5 === 0 ? "On leave" : "",
        })),
      });
    }
    await Attendance.insertMany(docs);
    console.log(`✓ Attendance seeded for ${docs.length} days`);
  } else {
    console.log("- Attendance already exists, skipping");
  }

  // --- Fees ---
  if ((await Fee.countDocuments()) === 0) {
    const feeDocs = students
      .filter((s) => s.feesPaid > 0)
      .map((s) => ({
        studentId: s._id,
        amount: s.feesPaid,
        paymentMethod: "upi",
        receiptNumber: generateReceiptNumber() + "-" + s.rollNo,
        // Use today so these payments always appear in the current month's
        // dashboard total. A hardcoded past date caused "Fees Collected (this month)"
        // to show ₹0 whenever the current date moved past that month.
        month: new Date().toLocaleString("en-IN", { month: "long", year: "numeric" }),
        paymentDate: new Date(),
      }));
    await Fee.insertMany(feeDocs);
    console.log(`✓ ${feeDocs.length} fee records created`);
  } else {
    console.log("- Fee records already exist, skipping");
  }

  // --- Enquiries ---
  if ((await Enquiry.countDocuments()) === 0) {
    const enquiries = await Enquiry.insertMany([
      { name: "Suresh Iyer", phone: "9876512345", class: "XI Science", message: "Interested in PCM batch for my son.", status: "new" },
      { name: "Lakshmi Menon", phone: "9876512346", class: "XII Commerce", message: "What are the timings for commerce batch?", status: "contacted" },
      { name: "Ramesh Babu", phone: "9876512347", class: "XI Arts", message: "Please share fee structure.", status: "new" },
    ]);
    console.log(`✓ ${enquiries.length} enquiries created`);
  } else {
    console.log("- Enquiries already exist, skipping");
  }

  console.log("\nSeed complete!");
  console.log("Admin login → admin@brightfuture.com / Admin@123");
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
