Havens Reach - Lost & Found (Node.js + Static Frontend)

How to run:

1. Extract the project.
2. In the project folder, install dependencies:
   npm install

3. Start the server:
   npm start

4. Open your browser at http://localhost:3000

API endpoints:
- GET  /api/items
- GET  /api/items/:id
- POST /api/items          (body: title,type,description,location,category,contactInfo,imageUrl)
- POST /api/items/:id/claim

Notes:
- This implementation uses an in-memory data store (no database). Data will reset when server restarts.
- The UI is a minimal reproduction of the Flutter app included in your uploaded project.