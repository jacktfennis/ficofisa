<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:architecture-guidelines -->
# Architecture Guidelines

These are the definitive architecture guidelines for this application.

Code priorities should be:
1. Readability
2. Maintainability
3. Speed
4. Duplication

## Frontend Architecture
The frontend architecture has some key tenants that it needs to follow.

1. This is a mobile first app. As such, all design choices should be made with the smallest screens in mind.
2. Every page goes into it's own folder, as per typical nextjs design.
3. In every page-folder, all relevant API calls are stored in an api.js file stored within the page's local directory, unless the call is owned by a component.
4. Components of frequently used renders should be stored in the components folder.
5. Every component should have a (component name) folder and a corresponding API.js file.
6. Components should own the API calls that are being used for it so that they can be reusable across pages.
7. Absolutely no cross-cutting.
8. This is a JS first app.


## Backend Architecture
***Scenario: A request is made to the ficofisa app***

1. Route.js - Receives the request.

    A. Unpacks the data being transmitted and calls the correlating function in ficofisa.jsx

2. Ficofisa.js - Orchestrates the feature logic for the app. 

    A. Calls the corresponding *Manager functions required to execute the task successfully.
    B. Can only call each *Manager a single time, but can call as many *Managers as necessary.

3. *Manager.js - Handles the feature work for a specific domain.

    A. Massages incoming data to be used on downstream data layer calls.

    B. Calls the eponymous data layer any number of times to accomplish the feature.

    C. Reconciles and manipulates data to perform business logic

4. *DataLayer.js - Handles all CRUD operations surrounding the specific feature.

    A. Recieves inputs and uses them to handle any data layer operation.

    B. Responsible for unpacking the data when possible.

The backend architecture follows a very specific flow.
1. There is absolutely no crosscutting. Managers cannot call other managers.
2. A datalayer can be for a database, a third party api, etc. The key component of a datalayer is that it is retrieving data from somewhere outside of memory.
3. There are no utility classes.
4. Naming complexity should be purposive.
5. When code duplication is occuring, the logic should be broken out into it's own Manager/Datalayer with a thematic namesake.
    
    A. Ficofisa function names should closely align with features, and should be high level enough that someone totally unassociated with the code (ie a product owner) should be able to understand what's occuring.

    B. *Manager function names should closely align with their thematic namesake.

    C. *DataLayer function names should closely align with the CRUD action they're taking in the database, as opposed to the feature work they're accomplishing, and should be most technical in name.

<!-- END:architecture-guidelines -->