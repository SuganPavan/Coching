export interface StudentDTO {
  _id: string;
  rollNo: string;
  name: string;
  class: string;
  subjects: string[];
  phone: string;
  parentPhone: string;
  email?: string;
  address: string;
  photo?: string;
  dateOfBirth?: string;
  joiningDate: string;
  isActive: boolean;
  totalFee: number;
  feesPaid: number;
  pendingFee: number;
  createdAt?: string;
}

export interface FacultyDTO {
  _id: string;
  name: string;
  qualification: string;
  subjects: string[];
  experience: number;
  phone: string;
  email?: string;
  photo?: string;
  bio?: string;
  isActive: boolean;
}

export interface CourseDTO {
  _id: string;
  name: string;
  class: string;
  stream: string;
  subjects: string[];
  duration: string;
  fee: number;
  description?: string;
  isActive: boolean;
}

export interface AttendanceRecordDTO {
  studentId: string;
  studentName?: string;
  rollNo?: string;
  status: "present" | "absent" | "late";
  remarks?: string;
}

export interface AttendanceDTO {
  _id: string;
  date: string;
  class: string;
  records: AttendanceRecordDTO[];
}

export interface FeeDTO {
  _id: string;
  studentId: string;
  studentName?: string;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  receiptNumber: string;
  month: string;
  remarks?: string;
}

export interface GalleryDTO {
  _id: string;
  title: string;
  imageUrl: string;
  publicId: string;
  category?: string;
  createdAt: string;
}

export interface EnquiryDTO {
  _id: string;
  name: string;
  phone: string;
  class: string;
  message?: string;
  status: "new" | "contacted" | "enrolled" | "closed";
  createdAt: string;
}

export interface DashboardStats {
  totalStudents: number;
  presentToday: number;
  totalToday: number;
  feesCollectedThisMonth: number;
  pendingFees: number;
  totalCourses: number;
  totalFaculty: number;
}
