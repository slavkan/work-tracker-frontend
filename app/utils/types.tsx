export interface Person {
  company: any;
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  password: string;
  phone: string | null;
  admin: boolean;
  companyAdmin: boolean;
  supervisor: boolean;
  worker: boolean;
}

export interface Company {
  id: number;
  name: string;
  abbreviation: string;
}

export interface Department {
  id: number;
  name: string;
  company: Company;
}

// export interface Subject {
//   subject: any;
//   id: number;
//   name: string;
//   semester: number;
//   study: Study;
// }

export interface CompanyPerson {
  id: number;
  company: Company;
  person: Person;
}

export interface DepartmentPerson {
  id: number;
  department: Department;
  person: Person;
}

export interface WorkShift {
  id: number;
  startTime: Date;
  state: string;
  endTime: Date;
  department: Department;
  person: Person;
  codeForArrival: string;
  codeForArrivalPrevious: string;
  offsetInMinutes: number;
}

export interface WorkAttendance {
  id: number;
  arrivalTime: Date;
  departureTime: Date;
  person: Person;
}

export interface SessionMessage {
  classSessionId: number;
  subjectName: string;
  personId: number;
  firstName: string;
  lastName: string;
  arrivalTime: string;
  departureTime: string;
  message: string;
}

export interface Sort {
  empty: boolean;
  sorted: boolean;
  unsorted: boolean;
}

export interface Pageable {
  pageNumber: number;
  pageSize: number;
  sort: Sort;
  offset: number;
  paged: boolean;
  unpaged: boolean;
}

export interface ApiResponsePerson {
  content: Person[];
  pageable: Pageable;
  last: boolean;
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  sort: Sort;
  numberOfElements: number;
  first: boolean;
  empty: boolean;
}