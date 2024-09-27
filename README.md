# ClassNet Backend

ClassNet is a virtual classroom management system where teachers can create classes, manage resources, and communicate with students. This backend provides APIs to handle class information, user roles, and other classroom-related functionalities.

## Table of Contents

- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running the Server](#running-the-server)
- [API Endpoints](#api-endpoints)
  - [Users](#users)
  - [Classes](#classes)

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/classnet-backend.git
   cd classnet-backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Environment Variables

## Environment Variables

Create a `.env` file at the root of your project and add the following environment variables:

```bash
MONGO_URI=mongodb://localhost:27017/classnet
PORT=5000
JWT_SECRET=your-secret-key
DB_PASS
DB_USER
```

## Environment Variables

Run on local machine:

```bash
nodemon index.js
```

## API Endpoints

The ClassNet backend provides various endpoints for interacting with the class and user data. Below are the available API routes and their descriptions.

### Classes

#### GET /classes

Fetch classes.

- **URL**: `/users`

```bash
  GET /users/email?email=john@example.com
```

```bash
  POST /users
```

- **URL**: `/classes`

```bash
  GET /classes/classid?id={classId}
```

```bash
  POST /classes
```

```bash
  GET /classes/teacher?email=teacher@example.com
```

```bash
  GET /classes/student?email=student@example.com
```

```json
[
  {
    "_id": "66f48e0de599ccd55d161d39",
    "classId": "c001",
    "className": "The Law of Thermodynamics",
    "section": "11/B",
    "subject": "Physics",
    "teacher": {
      "name": "Brenden Rutledge",
      "email": "teacher@class.com"
    },
    "students": [
      {
        "name": "Alice Smith",
        "email": "alice.smith@example.com"
      }
    ]
  }
]
```
