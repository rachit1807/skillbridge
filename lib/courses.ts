export const courses = [
  {
    id: "web",
    title: "The modern web, built right.",
    category: "Development",
    level: "Beginner",
    hours: 6,
    color: "#65c9ef",
    icon: "⌘",
    description:
      "Build a thoughtful, accessible web experience from the first HTML element to a responsive interface.",
    lessons: [
      {
        title: "How the web fits together",
        body: "A browser requests a URL. The server returns HTML, CSS and JavaScript. HTML gives content meaning; CSS defines its presentation; JavaScript adds behavior. Open your browser developer tools and inspect the document tree of a page you visit daily.",
        task: "Create an HTML document with a header, main element and footer. Explain the role of each.",
      },
      {
        title: "Semantic HTML & accessibility",
        body: "Use native elements for native behavior: buttons for actions, links for navigation, labels for inputs. Heading levels describe a document hierarchy. Every interaction must work with a keyboard, and visible focus indicators help people know where they are.",
        task: "Build a labeled signup form and navigate it using only your keyboard.",
      },
      {
        title: "Layouts that adapt",
        body: "CSS Grid handles two-dimensional layout while Flexbox arranges items along an axis. Prefer fluid widths, minmax and responsive gaps. Start with the smallest screen, then introduce breakpoints when content needs more room.",
        task: "Build a course card grid that moves from one column on mobile to three columns on desktop.",
      },
      {
        title: "JavaScript in the interface",
        body: "State represents what the interface knows. Events update state; rendering reflects it. Keep data separate from presentation. Handle loading, empty and error states as carefully as the happy path.",
        task: "Add a course search field that filters cards and includes an empty state.",
      },
      {
        title: "Working with an API",
        body: "HTTP methods express intent: GET reads, POST creates, PATCH updates and DELETE removes. Check response status before consuming JSON. Treat user input as untrusted on the server and use meaningful status codes.",
        task: "Fetch a JSON resource and show a loading indicator, success content and a retry action.",
      },
      {
        title: "Ship your first experience",
        body: "Before publishing, verify keyboard access, contrast, mobile overflow and form validation. Build production assets, keep secrets outside source control, and document how another developer can run your project.",
        task: "Publish your project and write a README with setup, features and screenshots.",
      },
    ],
  },
  {
    id: "react",
    title: "Think in components.",
    category: "Development",
    level: "Intermediate",
    hours: 8,
    color: "#8d9ee3",
    icon: "⚛",
    description:
      "Turn complex interfaces into small, reusable React components and connect them to real data.",
    lessons: [
      {
        title: "Components & props",
        body: "A component is a reusable unit of interface. Props carry data from parent to child. Keep components focused and prefer composition over large sets of conditional switches.",
        task: "Create a reusable course card with title, level and duration props.",
      },
      {
        title: "State & interactions",
        body: "Use state for values that change what is rendered. Derive filtered data from existing state instead of storing duplicate values. Update arrays and objects immutably.",
        task: "Build a searchable list with a category selector.",
      },
      {
        title: "Effects & remote data",
        body: "Effects synchronize with external systems. Clean up subscriptions and cancel obsolete requests. Keep loading and error states explicit and avoid effects for values that can be calculated during rendering.",
        task: "Fetch a resource with cancellation and retry.",
      },
      {
        title: "Context & authentication",
        body: "Context shares session state through a component tree. The server remains responsible for access control. A protected UI route improves navigation but cannot replace server authorization.",
        task: "Create an authentication provider and a protected dashboard.",
      },
    ],
  },
  {
    id: "design",
    title: "Interfaces with intention.",
    category: "Design",
    level: "Beginner",
    hours: 4,
    color: "#d9b673",
    icon: "◈",
    description:
      "Learn hierarchy, typography and design systems to create calm, purposeful digital products.",
    lessons: [
      {
        title: "Visual hierarchy",
        body: "Size, space and contrast guide attention. Give the primary task one clear visual anchor and reduce competition from secondary content.",
        task: "Sketch a landing page with a single primary call to action.",
      },
      {
        title: "Typography & rhythm",
        body: "Choose a readable type scale and consistent line heights. Limit line length and use space to group related content. A small number of deliberate styles creates stronger consistency.",
        task: "Define heading, body, caption and label styles.",
      },
      {
        title: "Build a design system",
        body: "Tokens encode repeatable decisions such as color, spacing and radii. Components combine these decisions into patterns. Test each component in light and dark themes.",
        task: "Document a button, input and card in both themes.",
      },
    ],
  },
  {
    id: "api",
    title: "Behind every great product.",
    category: "Backend",
    level: "Intermediate",
    hours: 7,
    color: "#67bdb1",
    icon: "↔",
    description:
      "Design reliable APIs, model durable data and protect the resources your users trust you with.",
    lessons: [
      {
        title: "Design an API contract",
        body: "Model endpoints around resources. Use predictable request bodies, consistent errors and appropriate status codes. Document which endpoints require authentication.",
        task: "Write an API contract for course enrollment.",
      },
      {
        title: "Relational data modeling",
        body: "Tables describe entities and relationships. Unique constraints prevent duplicate data; foreign keys maintain integrity. Index the fields used to find records frequently.",
        task: "Model users, courses and enrollments with their relationships.",
      },
      {
        title: "Secure sessions",
        body: "Hash passwords using a slow password derivation function and random salts. Keep session credentials in HttpOnly cookies, expire sessions and invalidate them on logout. Never trust a user identifier from an unverified request.",
        task: "Describe the lifecycle of a secure login session.",
      },
      {
        title: "Validation & reliability",
        body: "Validate requests on the server. Restrict each query to the authenticated user and use parameterized statements. Test unauthorized requests, malformed inputs and cross-account access.",
        task: "Write an integration test proving one user cannot change another user’s progress.",
      },
    ],
  },
  {
    id: "data",
    title: "Make data tell a story.",
    category: "Data",
    level: "Beginner",
    hours: 5,
    color: "#76acdd",
    icon: "▥",
    description:
      "Ask better questions, read datasets critically and communicate findings with clear visualizations.",
    lessons: [
      {
        title: "Start with a question",
        body: "A useful analysis begins with a decision or question. Define the population, time period and metric before collecting data. Distinguish correlation from evidence of causation.",
        task: "Write a measurable question about learning activity.",
      },
      {
        title: "Clean before you count",
        body: "Check missing values, duplicates, inconsistent categories and units. Keep the raw source and document transformations so the result can be reproduced.",
        task: "Create a checklist for validating an enrollment dataset.",
      },
      {
        title: "Choose the right chart",
        body: "Use bars for category comparisons, lines for change over time and scatter plots for relationships. Label axes, avoid misleading scales and make the main finding clear.",
        task: "Sketch a chart showing weekly lesson completion.",
      },
    ],
  },
  {
    id: "git",
    title: "Your work. In version control.",
    category: "Tools",
    level: "Beginner",
    hours: 3,
    color: "#b8a1d7",
    icon: "⑂",
    description:
      "Build a confident Git workflow with focused commits, branches and thoughtful code reviews.",
    lessons: [
      {
        title: "Snapshots & commits",
        body: "Git records snapshots of your project. Stage related changes together and write commit messages that explain their purpose. Keep generated files and secrets out of the repository.",
        task: "Initialize a repository, add a gitignore and create your first commit.",
      },
      {
        title: "Branches & collaboration",
        body: "A branch gives a change its own history. Keep changes focused and review the diff before merging. Resolve conflicts by understanding both intentions and testing the combined result.",
        task: "Create a feature branch and merge a small change.",
      },
      {
        title: "A reviewable project",
        body: "A README explains the problem, setup and behavior. Include reproducible commands and honest limitations. Review your project as though you are opening it for the first time.",
        task: "Write a clean project README and review every tracked file.",
      },
    ],
  },
];
