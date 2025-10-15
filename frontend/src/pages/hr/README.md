# Recruitment Management System

## Overview

The Recruitment Management System is a comprehensive solution for managing job postings, candidate applications, interviews, and the entire hiring process. Built with React, TypeScript, and modern UI components, it provides a seamless experience for HR teams to manage recruitment workflows.

## Architecture

### Backend Integration

The system integrates with a robust backend API that includes:

- **Job Postings**: Full CRUD operations for job postings
- **Candidate Management**: Application tracking and stage progression
- **Interview Scheduling**: Interview management and feedback
- **Analytics**: KPIs and recruitment metrics
- **Workflow Management**: Stage transitions and approval processes

### Database Schema

Key models from the Prisma schema:

```prisma
model JobPosting {
  id           String       @id @default(uuid())
  title        String
  description  String
  department   Department   @relation(fields: [departmentId], references: [id])
  departmentId String
  isActive     Boolean      @default(true)
  candidates   Candidate[]
  skills       JobPostingSkill[]
  createdAt    DateTime     @default(now())
}

model Candidate {
  id             String           @id @default(uuid())
  firstName      String
  lastName       String
  email          String
  phone          String?
  resumeUrl      String?
  stage          InterviewStage   @default(APPLIED)
  score          Int?
  feedback       String?
  jobPosting     JobPosting       @relation(fields: [jobPostingId], references: [id])
  jobPostingId   String
  interviews     Interview[]
  createdAt      DateTime         @default(now())
}

model Interview {
  id           String     @id @default(uuid())
  candidate    Candidate  @relation(fields: [candidateId], references: [candidateId])
  candidateId  String
  interviewer  Employee?  @relation("InterviewInterviewer", fields: [interviewerId], references: [id])
  interviewerId String?
  date         DateTime
  feedback     String?
  rating       Int?
}
```

## Frontend Components

### Core Files

1. **`/api/recruitmentApi.js`** - API service layer
2. **`/stores/useRecruitmentStore.js`** - Zustand state management
3. **`/pages/hr/hooks/useRecruitment.js`** - React Query hooks
4. **`/pages/hr/RecruitmentList.jsx`** - Job postings list page
5. **`/pages/hr/RecruitmentDetail.jsx`** - Job posting detail with candidates
6. **`/components/hr/RecruitmentComponents.jsx`** - Reusable components

### Key Features

#### 1. Job Posting Management

- **Create/Edit Job Postings**: Full form with validation
- **Job Status Management**: Active/Archived states
- **Department Integration**: Links to department system
- **Skills Requirements**: Job-specific skill requirements

#### 2. Candidate Management

- **Application Tracking**: Complete candidate lifecycle
- **Stage Progression**: Visual progress tracking
- **Scoring System**: Candidate evaluation and feedback
- **Communication**: Email notifications and updates

#### 3. Interview Management

- **Scheduling**: Interview calendar integration
- **Feedback Collection**: Structured interview feedback
- **Rating System**: Candidate scoring and evaluation
- **Interviewer Assignment**: Employee-based interviewer management

#### 4. Analytics & Reporting

- **Recruitment KPIs**: Key performance indicators
- **Hiring Metrics**: Success rates and time-to-hire
- **Activity Feeds**: Real-time recruitment updates
- **Dashboard Integration**: HR dashboard widgets

## Usage Examples

### Basic Job Posting Creation

```jsx
import { useCreateJobPosting } from '../hooks/useRecruitment';

const CreateJobForm = () => {
  const createJobMutation = useCreateJobPosting();
  
  const handleSubmit = (jobData) => {
    createJobMutation.mutate(jobData);
  };
  
  return (
    <JobPostingForm onSubmit={handleSubmit} />
  );
};
```

### Candidate Management

```jsx
import { useCandidatesForJob, useUpdateCandidateStage } from '../hooks/useRecruitment';

const CandidateList = ({ jobId }) => {
  const { data: candidates } = useCandidatesForJob(jobId);
  const updateStageMutation = useUpdateCandidateStage();
  
  const handleStageChange = (candidateId, stage) => {
    updateStageMutation.mutate({ candidateId, stage });
  };
  
  return (
    <div>
      {candidates?.map(candidate => (
        <CandidateCard 
          key={candidate.id}
          candidate={candidate}
          onStageChange={handleStageChange}
        />
      ))}
    </div>
  );
};
```

### Interview Scheduling

```jsx
import { useScheduleInterview } from '../hooks/useRecruitment';

const InterviewScheduler = ({ candidateId }) => {
  const scheduleInterviewMutation = useScheduleInterview();
  
  const handleSchedule = (interviewData) => {
    scheduleInterviewMutation.mutate({
      ...interviewData,
      candidateId
    });
  };
  
  return (
    <InterviewForm onSubmit={handleSchedule} />
  );
};
```

## API Endpoints

### Job Postings

- `GET /hr/recruitment/jobs` - List job postings
- `POST /hr/recruitment/jobs` - Create job posting
- `GET /hr/recruitment/jobs/:id` - Get job posting details
- `PUT /hr/recruitment/jobs/:id` - Update job posting
- `DELETE /hr/recruitment/jobs/:id` - Archive job posting

### Candidates

- `GET /hr/recruitment/jobs/:id/candidates` - List candidates for job
- `POST /hr/recruitment/jobs/:id/candidates` - Add candidate
- `PUT /hr/recruitment/candidates/:id/stage` - Update candidate stage
- `PUT /hr/recruitment/candidates/:id/score` - Set candidate score
- `POST /hr/recruitment/candidates/:id/hire` - Hire candidate

### Interviews

- `POST /hr/recruitment/interviews` - Schedule interview
- `PUT /hr/recruitment/interviews/:id` - Update interview
- `GET /hr/recruitment/candidates/:id/interviews` - List candidate interviews

### Analytics

- `GET /hr/recruitment/kpis` - Get recruitment KPIs

## State Management

### Zustand Store Structure

```javascript
const useRecruitmentStore = create((set, get) => ({
  // State
  jobPostings: [],
  candidates: [],
  interviews: [],
  kpis: null,
  selectedJobPosting: null,
  selectedCandidate: null,
  isLoading: false,
  error: null,
  
  // Actions
  fetchJobPostings: async (params) => { /* ... */ },
  createJobPosting: async (data) => { /* ... */ },
  updateJobPosting: async (id, data) => { /* ... */ },
  // ... more actions
}));
```

### React Query Integration

```javascript
// Query keys for consistent caching
export const queryKeys = {
  recruitment: {
    jobPostings: {
      all: ['recruitment', 'job-postings'],
      list: (params) => ['recruitment', 'job-postings', 'list', params],
      detail: (id) => ['recruitment', 'job-postings', 'detail', id],
    },
    candidates: {
      list: (jobId) => ['recruitment', 'candidates', 'list', jobId],
      detail: (id) => ['recruitment', 'candidates', 'detail', id],
    },
    // ... more keys
  },
};
```

## Component Library

### Reusable Components

1. **RecruitmentStats** - KPI dashboard cards
2. **CandidateStageProgress** - Visual progress tracking
3. **InterviewSchedule** - Interview management
4. **CandidateSearchFilter** - Search and filtering
5. **RecruitmentActivityFeed** - Activity timeline

### Usage

```jsx
import { 
  RecruitmentStats, 
  CandidateStageProgress,
  InterviewSchedule 
} from '../components/hr/RecruitmentComponents';

const RecruitmentDashboard = () => {
  return (
    <div className="space-y-6">
      <RecruitmentStats kpis={kpis} />
      <CandidateStageProgress candidate={candidate} />
      <InterviewSchedule interviews={interviews} />
    </div>
  );
};
```

## Validation & Error Handling

### Form Validation

```javascript
// Job posting validation
export const validateJobPosting = (data) => {
  const errors = {};
  
  if (!data.title?.trim()) {
    errors.title = 'Job title is required';
  }
  
  if (!data.description?.trim()) {
    errors.description = 'Job description is required';
  }
  
  if (!data.departmentId) {
    errors.departmentId = 'Department is required';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
```

### Error Handling

```javascript
// API error handling
const handleApiError = (error) => {
  const errorMessage = error.response?.data?.message || 'An error occurred';
  toast.error(errorMessage);
  console.error('API Error:', error);
};
```

## Performance Optimizations

### React Query Caching

- **Stale Time**: 5 minutes for job postings, 2 minutes for candidates
- **Cache Time**: 10 minutes for KPIs
- **Background Refetch**: Automatic data updates
- **Optimistic Updates**: Immediate UI updates

### Component Optimization

- **React.memo**: Prevent unnecessary re-renders
- **useMemo**: Expensive calculations
- **useCallback**: Event handler optimization
- **Lazy Loading**: Code splitting for large components

## Security & Permissions

### Permission System

The system integrates with the backend permission system:

- `recruitment:read` - View job postings and candidates
- `recruitment:create` - Create job postings and add candidates
- `recruitment:update` - Update job postings and candidate stages
- `recruitment:delete` - Archive job postings

### Data Validation

- **Frontend Validation**: Real-time form validation
- **Backend Validation**: Server-side validation
- **Type Safety**: TypeScript for compile-time checks
- **Input Sanitization**: XSS protection

## Future Enhancements

### Planned Features

1. **Advanced Analytics**: More detailed reporting
2. **Email Templates**: Automated communication
3. **Document Management**: Resume and document handling
4. **Integration**: ATS and HRIS integration
5. **Mobile Support**: Responsive mobile interface
6. **Workflow Automation**: Automated stage transitions
7. **Collaboration**: Team-based recruitment
8. **AI Integration**: Candidate matching and scoring

### Technical Improvements

1. **Real-time Updates**: WebSocket integration
2. **Offline Support**: PWA capabilities
3. **Performance**: Virtual scrolling for large lists
4. **Accessibility**: Enhanced a11y support
5. **Testing**: Comprehensive test coverage
6. **Documentation**: API documentation
7. **Monitoring**: Error tracking and analytics

## Getting Started

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Environment Setup

```bash
# Backend API URL
VITE_API_URL=http://localhost:4000/api

# Authentication
VITE_AUTH_ENABLED=true
```

### Usage

1. **Navigate to Recruitment**: `/recruitment`
2. **Create Job Posting**: Click "Create Job Posting"
3. **Add Candidates**: Click "Add Candidate" on job detail page
4. **Manage Stages**: Use stage progression buttons
5. **Schedule Interviews**: Use interview scheduling
6. **Track Progress**: Monitor candidate progress

## Support

For technical support or feature requests, please contact the development team or create an issue in the project repository.

---

*This documentation is maintained alongside the codebase and updated with each release.*