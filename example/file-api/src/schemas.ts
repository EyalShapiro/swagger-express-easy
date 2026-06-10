import { defineEntityFromExample } from 'swagger-express-easy';

// 1. Simple Flat Object
export const FileInfo = defineEntityFromExample('FileInfo', {
  name: 'index.ts',
  size: 1240,
  extension: '.ts',
});

// 2. Complex Object with Dates and Booleans
export const FileDetails = defineEntityFromExample('FileDetails', {
  name: 'package.json',
  size: 1024,
  extension: '.json',
  createdAt: '2024-03-24T10:00:00Z',
  modifiedAt: '2024-03-24T12:30:00Z',
  isDirectory: false,
});

// 3. Object with numbers
export const DirectoryStats = defineEntityFromExample('DirectoryStats', {
  totalFiles: 52,
  totalDirectories: 8,
  totalSize: 124000,
});

// 4. Highly Nested Object with Arrays
export const ProjectStructure = defineEntityFromExample('ProjectStructure', {
  projectName: 'MyAwesomeAPI',
  version: '1.0.0',
  isPrivate: true,
  rootDirectory: {
    path: '/',
    stats: {
      totalFiles: 52,
      totalDirectories: 8,
      totalSize: 124000,
    },
    files: [
      {
        name: 'package.json',
        size: 1024,
        extension: '.json',
      },
    ],
    metadata: {
      owner: 'Admin',
      lastScan: '2024-03-24T10:00:00Z',
      tags: ['nodejs', 'api'],
    },
  },
});
