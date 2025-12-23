export interface Lesson {
  id: string;
  title: string;
  duration: string;
  isLocked: boolean;
  status: 'completed' | 'in-progress' | 'not-started';
  videoUrl: string;
}

export interface Resource {
  id: string;
  title: string;
  type: 'pdf' | 'link';
  url: string;
}

export interface Review {
  id: string;
  userName: string;
  date: string;
  content: string;
  rating: number; // 1-5
  avatarUrl?: string; // Optional
}

export interface ModuleData {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
  resources: Resource[];
  reviews: Review[];
  totalQuestions: number; // For assessment display
}

export const modules: ModuleData[] = [
  {
    id: '1',
    title: 'Introduction to React Native',
    description: 'Learn the basics of React Native development.',
    totalQuestions: 10,
    lessons: [
      {
        id: '1-1',
        title: 'Setting up the Environment',
        duration: '5:00',
        isLocked: false,
        status: 'not-started',
        videoUrl: 'http://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4',
      },
      {
        id: '1-2',
        title: 'Creating Your First Component',
        duration: '10:30',
        isLocked: true,
        status: 'not-started',
        videoUrl: 'http://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4',
      },
      {
        id: '1-3',
        title: 'Styling with Flexbox',
        duration: '8:45',
        isLocked: true,
        status: 'not-started',
        videoUrl: 'http://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4',
      },
    ],
    resources: [
      {
        id: 'r1',
        title: 'React Native Docs',
        type: 'link',
        url: 'https://reactnative.dev/docs/getting-started',
      },
      {
        id: 'r2',
        title: 'Course Slides (PDF)',
        type: 'pdf',
        url: 'https://example.com/slides.pdf',
      },
    ],
    reviews: [
      {
        id: 'rev1',
        userName: 'Alice Johnson',
        date: '2023-10-25',
        rating: 5,
        content: 'Great introduction! Very clear.',
        avatarUrl: 'https://i.pravatar.cc/150?u=alice',
      },
       {
        id: 'rev2',
        userName: 'Bob Smith',
        date: '2023-11-01',
        rating: 4,
        content: 'Good content, but sound quality could be better.',
        avatarUrl: 'https://i.pravatar.cc/150?u=bob',
      },
    ],
  },
  {
    id: '2',
    title: 'Advanced State Management',
    description: 'Master Zustand, Redux, and Context API.',
    totalQuestions: 15,
    lessons: [
       {
        id: '2-1',
        title: 'Context API Deep Dive',
        duration: '12:00',
        isLocked: false,
        status: 'not-started',
         videoUrl: 'http://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4',
      },
    ],
     resources: [],
    reviews: [],
  }
];
