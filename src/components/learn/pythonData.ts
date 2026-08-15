export interface Exercise {
  id: string;
  numberLabel: string; // e.g. "Exercise 1" or "Bonus Article"
  title: string;
  isUnlocked: boolean;
  isCompleted?: boolean;
  isBonus?: boolean;
  instruction?: string;
  initialCode?: string;
}

export type PlanetType =
  | "green-crater"
  | "swirl"
  | "striped-banded"
  | "saturn-ring"
  | "grid-web"
  | "moon-crater";

export interface Chapter {
  id: string;
  number: number;
  stationNumber: string; // e.g. "STATION 01"
  title: string;
  description: string;
  xpValue: number;
  planetType: PlanetType;
  isMilestone?: boolean;
  isClubLocked?: boolean;
  isUnlocked: boolean;
  isCompleted?: boolean;
  isCurrent?: boolean;
  exercises: Exercise[];
}

export interface UserProgressData {
  username: string;
  level: number;
  avatarUrl: string;
  exercisesCompleted: number;
  totalExercises: number;
  projectsCompleted: number;
  totalProjects: number;
  xpEarned: number;
  totalXp: number;
  badgesUnlocked: number;
  totalBadges: number;
  cheatSheetsUnlocked: number;
  totalCheatSheets: number;
}

export const MOCK_USER_PROGRESS: UserProgressData = {
  username: "rizi1",
  level: 1,
  avatarUrl: "/images/mascot.png",
  exercisesCompleted: 0,
  totalExercises: 43,
  projectsCompleted: 0,
  totalProjects: 2,
  xpEarned: 0,
  totalXp: 685,
  badgesUnlocked: 0,
  totalBadges: 8,
  cheatSheetsUnlocked: 0,
  totalCheatSheets: 2,
};

export const MOCK_PYTHON_CHAPTERS: Chapter[] = [
  {
    id: "ch-1",
    number: 1,
    stationNumber: "STATION 01",
    title: "HELLO WORLD",
    description: "Write your first line of Python by printing messages to the terminal.",
    xpValue: 55,
    planetType: "green-crater",
    isUnlocked: true,
    isCurrent: true,
    exercises: [
      {
        id: "ex-1",
        numberLabel: "Exercise 1",
        title: "Setting Up",
        isUnlocked: true,
        instruction: "Print 'Setting up Python 3.11...' to initialize your terminal environment.",
        initialCode: `# Exercise: Setting Up\n# Task: Print setting up message\n\nprint("Setting up Python 3.11...")`,
      },
      {
        id: "ex-2",
        numberLabel: "Exercise 2",
        title: "Hello World",
        isUnlocked: false,
        instruction: "Print the iconic greeting 'Hello, World!' to the terminal.",
        initialCode: `# Exercise: Hello World\n# Task: Print 'Hello, World!' below\n\nprint("Hello, World!")`,
      },
      {
        id: "ex-3",
        numberLabel: "Exercise 3",
        title: "Pattern",
        isUnlocked: false,
        instruction: "Use multiple print statements to create a 3-line ASCII star pattern.",
        initialCode: `# Exercise: Pattern\n# Task: Create an ASCII pattern\n\nprint("  *  ")\nprint(" *** ")\nprint("*****")`,
      },
      {
        id: "ex-4",
        numberLabel: "Exercise 4",
        title: "Initials",
        isUnlocked: false,
        instruction: "Display your initials using block letter print statements.",
        initialCode: `# Exercise: Initials\n# Task: Print your initials\n\nprint("C C C   D D D")\nprint("C       D   D")\nprint("C C C   D D D")`,
      },
      {
        id: "ex-5",
        numberLabel: "Exercise 5",
        title: "Snail Mail",
        isUnlocked: false,
        instruction: "Print a postcard message with recipient, location, and a greeting.",
        initialCode: `# Exercise: Snail Mail\n# Task: Send a postcard message\n\nprint("To: Cosmo Explorer")\nprint("Location: Station 01, Orbit Sector 7")\nprint("Message: Welcome to Python coding!")`,
      },
      {
        id: "ex-bonus-1",
        numberLabel: "Bonus Article",
        title: "Why Python?",
        isUnlocked: false,
        isBonus: true,
        instruction: "Learn why Python is the leading programming language for Web & AI.",
        initialCode: `# Bonus Article: Why Python?\n# Task: Print why Python is awesome\n\nprint("Python is simple, readable, and powers modern AI!")`,
      },
    ],
  },
  {
    id: "ch-2",
    number: 2,
    stationNumber: "STATION 02",
    title: "VARIABLES",
    description: "Master storing and manipulating numbers, strings, booleans, and variables in memory.",
    xpValue: 65,
    planetType: "swirl",
    isUnlocked: false,
    exercises: [
      {
        id: "ex-6",
        numberLabel: "Exercise 1",
        title: "Data Types",
        isUnlocked: false,
        instruction: "Create integer, string, and float variables and print them.",
        initialCode: `# Exercise: Data Types\n\nname = "Cosmo"\nage = 24\nscore = 98.5\n\nprint("Explorer:", name)\nprint("Level:", age)\nprint("Score:", score)`,
      },
      {
        id: "ex-7",
        numberLabel: "Exercise 2",
        title: "Temperature",
        isUnlocked: false,
        instruction: "Convert Fahrenheit temperature (77°F) into Celsius.",
        initialCode: `# Exercise: Temperature Conversion\n\ntemp_f = 77\ntemp_c = (temp_f - 32) * 5 / 9\n\nprint("Temperature in Celsius:", temp_c)`,
      },
      {
        id: "ex-8",
        numberLabel: "Exercise 3",
        title: "BMI Calculator",
        isUnlocked: false,
        instruction: "Calculate Body Mass Index using mass = 70 (kg) and height = 1.75 (m).",
        initialCode: `# Exercise: BMI Calculator\n# BMI = mass / (height ^ 2)\n\nmass = 70\nheight = 1.75\nbmi = mass / (height ** 2)\n\nprint("Calculated BMI:", bmi)`,
      },
      {
        id: "ex-9",
        numberLabel: "Exercise 4",
        title: "Pythagorean Theorem",
        isUnlocked: false,
        instruction: "Calculate the hypotenuse c of a right triangle with sides a = 3 and b = 4.",
        initialCode: `# Exercise: Pythagorean Theorem\n# c = sqrt(a^2 + b^2)\n\na = 3\nb = 4\nc = (a**2 + b**2)**0.5\n\nprint("Hypotenuse c:", c)`,
      },
      {
        id: "ex-10",
        numberLabel: "Exercise 5",
        title: "Currency Converter",
        isUnlocked: false,
        instruction: "Convert 100 USD into Euros and Japanese Yen.",
        initialCode: `# Exercise: Currency Converter\n\nusd = 100\neur = usd * 0.92\njpy = usd * 155.5\n\nprint("USD to EUR:", eur)\nprint("USD to JPY:", jpy)`,
      },
      {
        id: "ex-bonus-2",
        numberLabel: "Bonus Article",
        title: "Memory Allocation",
        isUnlocked: false,
        isBonus: true,
        instruction: "Explore how Python handles dynamic typing and garbage collection.",
        initialCode: `# Bonus Article: Memory Allocation\n\nx = 42\nprint("Variable x value:", x)`,
      },
    ],
  },
  {
    id: "ch-3",
    number: 3,
    stationNumber: "STATION 03",
    title: "CONTROL FLOW",
    description: "Make decisions in code using if, elif, and else statements, along with logical operators.",
    xpValue: 70,
    planetType: "striped-banded",
    isClubLocked: true,
    isUnlocked: false,
    exercises: [
      {
        id: "ex-11",
        numberLabel: "Exercise 1",
        title: "Coin Flip",
        isUnlocked: false,
        instruction: "Check a coin flip variable and print 'Heads' or 'Tails'.",
        initialCode: `# Exercise: Coin Flip\n\ncoin = "heads"\n\nif coin == "heads":\n    print("Heads!")\nelse:\n    print("Tails!")`,
      },
      {
        id: "ex-12",
        numberLabel: "Exercise 2",
        title: "Grades",
        isUnlocked: false,
        instruction: "Determine letter grade A, B, or C from score = 88.",
        initialCode: `# Exercise: Grades\n\nscore = 88\n\nif score >= 90:\n    print("Grade: A")\nelif score >= 80:\n    print("Grade: B")\nelse:\n    print("Grade: C")`,
      },
      {
        id: "ex-13",
        numberLabel: "Exercise 3",
        title: "PH Levels",
        isUnlocked: false,
        instruction: "Evaluate a liquid's pH level (7.0) to determine if it is Acidic, Basic, or Neutral.",
        initialCode: `# Exercise: PH Levels\n\nph = 7.0\n\nif ph > 7.0:\n    print("Basic")\nelif ph < 7.0:\n    print("Acidic")\nelse:\n    print("Neutral")`,
      },
      {
        id: "ex-14",
        numberLabel: "Exercise 4",
        title: "Magic 8-Ball",
        isUnlocked: false,
        instruction: "Simulate a Magic 8-Ball fortune teller response.",
        initialCode: `# Exercise: Magic 8-Ball\n\nquestion = "Will I master Python?"\nanswer = "Outlook good!"\n\nprint("Question:", question)\nprint("Magic 8-Ball:", answer)`,
      },
      {
        id: "ex-15",
        numberLabel: "Exercise 5",
        title: "Sorting Hat",
        isUnlocked: false,
        instruction: "Assign points to Gryffindor or Slytherin and declare the winning house.",
        initialCode: `# Exercise: Sorting Hat\n\ngryffindor = 5\nslytherin = 3\n\nif gryffindor > slytherin:\n    print("Welcome to Gryffindor!")\nelse:\n    print("Welcome to Slytherin!")`,
      },
      {
        id: "ex-bonus-3",
        numberLabel: "Bonus Article",
        title: "Boolean Logic",
        isUnlocked: false,
        isBonus: true,
        instruction: "Learn boolean truth tables using AND, OR, and NOT.",
        initialCode: `# Bonus Article: Boolean Logic\n\nis_online = True\nis_admin = True\n\nif is_online and is_admin:\n    print("Admin access granted!")`,
      },
    ],
  },
  {
    id: "ch-4",
    number: 4,
    stationNumber: "STATION 04",
    title: "LOOPS",
    description: "Automate repetitive tasks and iterate over collections using for loops and while loops.",
    xpValue: 75,
    planetType: "saturn-ring",
    isClubLocked: true,
    isUnlocked: false,
    exercises: [
      {
        id: "ex-16",
        numberLabel: "Exercise 1",
        title: "Enter PIN",
        isUnlocked: false,
        instruction: "Use a while loop to verify security PIN 1234.",
        initialCode: `# Exercise: Enter PIN\n\npin = 1234\nentered_pin = 1234\n\nwhile entered_pin == pin:\n    print("PIN accepted! Access granted.")\n    break`,
      },
      {
        id: "ex-17",
        numberLabel: "Exercise 2",
        title: "Guess Number",
        isUnlocked: false,
        instruction: "Verify if guess equals target number 7.",
        initialCode: `# Exercise: Guess Number\n\nguess = 7\ntarget = 7\n\nif guess == target:\n    print("You guessed it right!")`,
      },
      {
        id: "ex-18",
        numberLabel: "Exercise 3",
        title: "99 Bottles",
        isUnlocked: false,
        instruction: "Use a for loop in reverse to print bottle countdown.",
        initialCode: `# Exercise: 99 Bottles\n\nfor i in range(3, 0, -1):\n    print(f"{i} bottles of juice on the wall!")`,
      },
      {
        id: "ex-19",
        numberLabel: "Exercise 4",
        title: "Fizz Buzz",
        isUnlocked: false,
        instruction: "Print Fizz for multiples of 3, Buzz for 5, and FizzBuzz for both.",
        initialCode: `# Exercise: Fizz Buzz\n\nfor i in range(1, 16):\n    if i % 3 == 0 and i % 5 == 0:\n        print("FizzBuzz")\n    elif i % 3 == 0:\n        print("Fizz")\n    elif i % 5 == 0:\n        print("Buzz")\n    else:\n        print(i)`,
      },
      {
        id: "ex-20",
        numberLabel: "Exercise 5",
        title: "Asterisks",
        isUnlocked: false,
        instruction: "Use a loop to print a right-angled asterisk triangle.",
        initialCode: `# Exercise: Asterisks\n\nfor i in range(1, 5):\n    print("*" * i)`,
      },
      {
        id: "ex-bonus-4",
        numberLabel: "Bonus Article",
        title: "Loop Efficiency",
        isUnlocked: false,
        isBonus: true,
        instruction: "Learn how list comprehensions speed up loop iteration.",
        initialCode: `# Bonus Article: Loop Efficiency\n\nnumbers = [1, 2, 3, 4, 5]\nsquares = [n**2 for n in numbers]\nprint("Squares:", squares)`,
      },
    ],
  },
  {
    id: "ch-checkpoint",
    number: 0,
    stationNumber: "MILESTONE 01",
    title: "CHECKPOINT PROJECT",
    description: "Test your skills by building a complete interactive Python terminal adventure project.",
    xpValue: 100,
    planetType: "grid-web",
    isMilestone: true,
    isClubLocked: true,
    isUnlocked: false,
    exercises: [
      {
        id: "ex-cp-1",
        numberLabel: "Project 1",
        title: "Terminal Adventure Game",
        isUnlocked: false,
        instruction: "Build a text-based terminal space adventure game.",
        initialCode: `# Project: Terminal Adventure Game\n\nplayer = "Cosmo Navigator"\nhealth = 100\n\nprint(f"Welcome, {player}! Health: {health}")\nprint("You enter orbit around Planet X...")`,
      },
    ],
  },
  {
    id: "ch-5",
    number: 5,
    stationNumber: "STATION 05",
    title: "LISTS",
    description: "Store multiple items in a single variable and perform slicing, sorting, and list methods.",
    xpValue: 70,
    planetType: "swirl",
    isClubLocked: true,
    isUnlocked: false,
    exercises: [
      {
        id: "ex-21",
        numberLabel: "Exercise 1",
        title: "Grocery List",
        isUnlocked: false,
        instruction: "Create a list of groceries and print count & first item.",
        initialCode: `# Exercise: Grocery List\n\nitems = ["Apples", "Bananas", "Milk"]\nprint("Grocery count:", len(items))\nprint("First item:", items[0])`,
      },
      {
        id: "ex-22",
        numberLabel: "Exercise 2",
        title: "Inventory",
        isUnlocked: false,
        instruction: "Append new items to your space equipment inventory.",
        initialCode: `# Exercise: Inventory\n\ninventory = ["Laser Pistol", "Shield", "Fuel Cell"]\ninventory.append("Quantum Key")\nprint("Inventory:", inventory)`,
      },
      {
        id: "ex-23",
        numberLabel: "Exercise 3",
        title: "Mixtape",
        isUnlocked: false,
        instruction: "Iterate through a space playlist and print song titles.",
        initialCode: `# Exercise: Mixtape\n\nplaylist = ["Cosmic Beats", "Starlight Melody", "Nebula Vibe"]\nfor song in playlist:\n    print("Now playing:", song)`,
      },
      {
        id: "ex-24",
        numberLabel: "Exercise 4",
        title: "Reading List",
        isUnlocked: false,
        instruction: "Calculate length of your programming reading list.",
        initialCode: `# Exercise: Reading List\n\nbooks = ["Clean Code", "Python Crash Course", "Automate The Boring Stuff"]\nprint("Total Books:", len(books))`,
      },
      {
        id: "ex-25",
        numberLabel: "Exercise 5",
        title: "Bucket List",
        isUnlocked: false,
        instruction: "Pop an item from your bucket list and display active goals.",
        initialCode: `# Exercise: Bucket List\n\ngoals = ["Visit Mars", "Master Python", "Build AI Agent"]\ngoals.pop()\nprint("Active Goals:", goals)`,
      },
      {
        id: "ex-bonus-5",
        numberLabel: "Bonus Article",
        title: "List Comprehensions",
        isUnlocked: false,
        isBonus: true,
        instruction: "Filter even numbers using a single line list comprehension.",
        initialCode: `# Bonus Article: List Comprehensions\n\nevens = [x for x in range(10) if x % 2 == 0]\nprint("Evens:", evens)`,
      },
    ],
  },
  {
    id: "ch-6",
    number: 6,
    stationNumber: "STATION 06",
    title: "FUNCTIONS",
    description: "Encapsulate reusable blocks of code with custom parameters and return values.",
    xpValue: 75,
    planetType: "moon-crater",
    isClubLocked: true,
    isUnlocked: false,
    exercises: [
      {
        id: "ex-26",
        numberLabel: "Exercise 1",
        title: "Dry Code",
        isUnlocked: false,
        instruction: "Define a greet(name) function to eliminate code repetition.",
        initialCode: `# Exercise: DRY Code\n\ndef greet(name):\n    print("Greetings, " + name + "!")\n\ngreet("Cosmo")`,
      },
      {
        id: "ex-27",
        numberLabel: "Exercise 2",
        title: "Fortune Cookie",
        isUnlocked: false,
        instruction: "Create a function that returns a fortune string.",
        initialCode: `# Exercise: Fortune Cookie\n\ndef get_fortune():\n    return "A great adventure awaits in code!"\n\nprint("Your fortune:", get_fortune())`,
      },
      {
        id: "ex-28",
        numberLabel: "Exercise 3",
        title: "Calculator",
        isUnlocked: false,
        instruction: "Build an add(a, b) function that returns the sum of numbers.",
        initialCode: `# Exercise: Calculator\n\ndef add(a, b):\n    return a + b\n\nprint("Result:", add(15, 27))`,
      },
      {
        id: "ex-29",
        numberLabel: "Exercise 4",
        title: "Mars Weight",
        isUnlocked: false,
        instruction: "Calculate weight on Mars (38% of Earth weight).",
        initialCode: `# Exercise: Mars Weight\n\ndef calculate_mars_weight(earth_weight):\n    return earth_weight * 0.38\n\nprint("Mars weight (kg):", calculate_mars_weight(70))`,
      },
      {
        id: "ex-30",
        numberLabel: "Exercise 5",
        title: "Drive Thru",
        isUnlocked: false,
        instruction: "Return menu items by item number.",
        initialCode: `# Exercise: Drive Thru\n\ndef get_item(number):\n    menu = {1: "Burger", 2: "Fries", 3: "Soda"}\n    return menu.get(number, "Item not found")\n\nprint("Ordered:", get_item(2))`,
      },
      {
        id: "ex-bonus-6",
        numberLabel: "Bonus Article",
        title: "Scope & Closures",
        isUnlocked: false,
        isBonus: true,
        instruction: "Understand global vs local scope variable access.",
        initialCode: `# Bonus Article: Scope & Closures\n\nglobal_var = 100\n\ndef print_scope():\n    print("Global Scope Value:", global_var)\n\nprint_scope()`,
      },
    ],
  },
  {
    id: "ch-7",
    number: 7,
    stationNumber: "STATION 07",
    title: "CLASSES & OBJECTS",
    description: "Learn Object-Oriented Programming (OOP) by creating custom classes, methods, and instances.",
    xpValue: 85,
    planetType: "striped-banded",
    isClubLocked: true,
    isUnlocked: false,
    exercises: [
      {
        id: "ex-31",
        numberLabel: "Exercise 1",
        title: "Restaurants",
        isUnlocked: false,
        instruction: "Create a Restaurant class with name and cuisine attributes.",
        initialCode: `# Exercise: Restaurants\n\nclass Restaurant:\n    def __init__(self, name, cuisine):\n        self.name = name\n        self.cuisine = cuisine\n\nr = Restaurant("Cosmo Diner", "Space Foods")\nprint("Restaurant:", r.name, "-", r.cuisine)`,
      },
      {
        id: "ex-32",
        numberLabel: "Exercise 2",
        title: "Bank Account",
        isUnlocked: false,
        instruction: "Build an Account class with deposit method.",
        initialCode: `# Exercise: Bank Account\n\nclass Account:\n    def __init__(self, owner, balance):\n        self.owner = owner\n        self.balance = balance\n\n    def deposit(self, amount):\n        self.balance += amount\n\nacc = Account("Alice", 500)\nacc.deposit(200)\nprint("Updated Balance:", acc.balance)`,
      },
      {
        id: "ex-33",
        numberLabel: "Exercise 3",
        title: "Pokedex",
        isUnlocked: false,
        instruction: "Create a Pokemon class and instantiate Pikachu.",
        initialCode: `# Exercise: Pokedex\n\nclass Pokemon:\n    def __init__(self, name, type_name):\n        self.name = name\n        self.type_name = type_name\n\np = Pokemon("Pikachu", "Electric")\nprint(f"{p.name} is {p.type_name} type!")`,
      },
      {
        id: "ex-34",
        numberLabel: "Exercise 4",
        title: "Boba Shop",
        isUnlocked: false,
        instruction: "Create a BobaOrder class with drink and sugar level.",
        initialCode: `# Exercise: Boba Shop\n\nclass BobaOrder:\n    def __init__(self, drink, sugar_level):\n        self.drink = drink\n        self.sugar_level = sugar_level\n\norder = BobaOrder("Taro Milk Tea", "50%")\nprint("Order:", order.drink, "| Sugar:", order.sugar_level)`,
      },
      {
        id: "ex-35",
        numberLabel: "Exercise 5",
        title: "Favorite City",
        isUnlocked: false,
        instruction: "Build a City class with name and country attributes.",
        initialCode: `# Exercise: Favorite City\n\nclass City:\n    def __init__(self, name, country):\n        self.name = name\n        self.country = country\n\nc = City("Tokyo", "Japan")\nprint(f"City: {c.name}, Country: {c.country}")`,
      },
      {
        id: "ex-bonus-7",
        numberLabel: "Bonus Article",
        title: "Inheritance Patterns",
        isUnlocked: false,
        isBonus: true,
        instruction: "Inherit attributes from a parent Vehicle class.",
        initialCode: `# Bonus Article: Inheritance Patterns\n\nclass Vehicle:\n    speed = 100\n\nclass Spacecraft(Vehicle):\n    warp = True\n\ns = Spacecraft()\nprint("Speed:", s.speed, "| Warp:", s.warp)`,
      },
    ],
  },
  {
    id: "ch-8",
    number: 8,
    stationNumber: "STATION 08",
    title: "MODULES",
    description: "Organize Python code into reusable modules and leverage built-in libraries like math and random.",
    xpValue: 90,
    planetType: "moon-crater",
    isClubLocked: true,
    isUnlocked: false,
    exercises: [
      {
        id: "ex-36",
        numberLabel: "Exercise 1",
        title: "Slot Machine",
        isUnlocked: false,
        instruction: "Use random.choice to select a slot machine symbol.",
        initialCode: `# Exercise: Slot Machine\nimport random\n\nsymbols = ["🍒", "🍋", "🔔", "7️⃣"]\nprint("Slot outcome:", random.choice(symbols))`,
      },
      {
        id: "ex-37",
        numberLabel: "Exercise 2",
        title: "Countdown",
        isUnlocked: false,
        instruction: "Simulate a countdown using python loop.",
        initialCode: `# Exercise: Countdown\n\nprint("Countdown starting...")\nfor i in range(3, 0, -1):\n    print(i)\nprint("Liftoff! 🚀")`,
      },
      {
        id: "ex-38",
        numberLabel: "Exercise 3",
        title: "Solar System",
        isUnlocked: false,
        instruction: "Calculate surface area of Earth using math.pi.",
        initialCode: `# Exercise: Solar System\nimport math\n\nradius = 6371  # Earth radius in km\narea = 4 * math.pi * (radius ** 2)\nprint("Surface Area of Earth:", round(area), "sq km")`,
      },
      {
        id: "ex-39",
        numberLabel: "Exercise 4",
        title: "Wikipedia Search",
        isUnlocked: false,
        instruction: "Format search query string for Wikipedia module.",
        initialCode: `# Exercise: Wikipedia Search\n\nquery = "Python Programming"\nprint("Searching Wikipedia for:", query)`,
      },
      {
        id: "ex-40",
        numberLabel: "Exercise 5",
        title: "Custom Module",
        isUnlocked: false,
        instruction: "Define a calculate_xp(level) module function.",
        initialCode: `# Exercise: Custom Module\n\ndef calculate_xp(level):\n    return level * 100\n\nprint("Level 5 XP:", calculate_xp(5))`,
      },
      {
        id: "ex-bonus-8",
        numberLabel: "Bonus Article",
        title: "Package Ecosystem",
        isUnlocked: false,
        isBonus: true,
        instruction: "Print list of popular Python ecosystem packages.",
        initialCode: `# Bonus Article: Package Ecosystem\n\npackages = ["numpy", "pandas", "requests"]\nprint("Installed Packages:", ", ".join(packages))`,
      },
    ],
  },
  {
    id: "ch-final",
    number: 0,
    stationNumber: "FINAL MILESTONE",
    title: "FINAL PROJECT",
    description: "Combine everything you've learned to build a full-featured capstone Python application.",
    xpValue: 100,
    planetType: "grid-web",
    isMilestone: true,
    isClubLocked: true,
    isUnlocked: false,
    exercises: [
      {
        id: "ex-final-1",
        numberLabel: "Final Capstone",
        title: "Full Python Application",
        isUnlocked: false,
        instruction: "Build a complete capstone Python terminal application.",
        initialCode: `# Final Capstone Project: CosmoDex App\n\nprint("=== CosmoDex Python Command System ===")\nprint("Status: All Systems Operational")\nprint("Congratulations on completing the Python Galaxy Expedition!")`,
      },
    ],
  },
];
