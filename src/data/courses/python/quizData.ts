export interface QuizQuestion {
  id: string;
  question: string;
  codeSnippet?: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface ChapterQuizData {
  chapterId: string;
  title: string;
  codeExamples: {
    title: string;
    input: string;
    output: string;
    explanation: string;
  }[];
  practiceQuestion: {
    title: string;
    description: string;
    input: string;
    output: string;
    explanation: string;
  };
  mcqs: QuizQuestion[];
}

export const PYTHON_CHAPTERS_QUIZ_DATA: Record<string, ChapterQuizData> = {
  "ch-1": {
    chapterId: "ch-1",
    title: "Introduction to Python & Output",
    codeExamples: [
      {
        title: "Printing a Text Message",
        input: "print(\"Hello, World!\")\nprint(\"Welcome to Python 3.11!\")",
        output: "Hello, World!\nWelcome to Python 3.11!\n\n[Process finished with exit code 0]",
        explanation: "The print() function sends textual data to the standard output stream (terminal). Quotes specify that the enclosed text is a string literal."
      },
      {
        title: "Printing Math Calculations & Multiple Values",
        input: "print(\"Score:\", 40 + 15)\nprint(\"Coordinates:\", 12, 45, -3)",
        output: "Score: 55\nCoordinates: 12 45 -3\n\n[Process finished with exit code 0]",
        explanation: "Comma-separated arguments inside print() are automatically printed separated by spaces, and expressions like 40 + 15 evaluate before display."
      }
    ],
    practiceQuestion: {
      title: "Print Formatted Star Pattern",
      description: "Write a program that uses print statements to display a 3-tier cosmic arrow pointing upwards.",
      input: "print(\"   *   \")\nprint(\"  ***  \")\nprint(\" ***** \")",
      output: "   *   \n  ***  \n ***** \n\n[Process finished with exit code 0]",
      explanation: "Each print() statement outputs its string on a new line, yielding the formatted pyramid pattern."
    },
    mcqs: [
      {
        id: "ch1-q1",
        question: "Which of the following is the valid syntax to display text in Python 3?",
        options: [
          "echo 'Hello, World!'",
          "print('Hello, World!')",
          "System.out.print(\"Hello, World!\")",
          "Console.WriteLine(\"Hello, World!\")"
        ],
        correctAnswerIndex: 1,
        explanation: "In Python 3, print() is a built-in function that takes arguments within parentheses and prints them to stdout."
      },
      {
        id: "ch1-q2",
        question: "What will be the exact console output of the following line of code?",
        codeSnippet: "print(10 + 20, \"Points\")",
        options: [
          "10 + 20 Points",
          "30Points",
          "30 Points",
          "Error: Cannot add integer and string"
        ],
        correctAnswerIndex: 2,
        explanation: "Python evaluates 10 + 20 to 30 first. By default, print() separates multiple arguments with a space, resulting in '30 Points'."
      },
      {
        id: "ch1-q3",
        question: "Which symbol is used to create single-line comments in Python that are ignored during execution?",
        options: [
          "//",
          "/*",
          "#",
          "--"
        ],
        correctAnswerIndex: 2,
        explanation: "The hash symbol (#) indicates a single-line comment in Python. Everything following it on the same line is ignored by the interpreter."
      }
    ]
  },
  "ch-2": {
    chapterId: "ch-2",
    title: "Variables & Data Types",
    codeExamples: [
      {
        title: "Variable Declaration & Dynamic Typing",
        input: "player_name = \"Cosmo\"\nplayer_level = 42\nxp_multiplier = 1.75\nis_ready = True\n\nprint(player_name, \"Level:\", player_level)\nprint(\"Multiplier:\", xp_multiplier, \"Ready:\", is_ready)",
        output: "Cosmo Level: 42\nMultiplier: 1.75 Ready: True\n\n[Process finished with exit code 0]",
        explanation: "Variables are created simply by assigning a value with =. Python automatically infers string, integer, float, and boolean types."
      },
      {
        title: "Type Casting & Modern f-Strings",
        input: "raw_input = \"50\"\nbonus_xp = int(raw_input) + 25\n\nprint(f\"Bonus XP Awarded: {bonus_xp}\")",
        output: "Bonus XP Awarded: 75\n\n[Process finished with exit code 0]",
        explanation: "int('50') converts the string into a numerical integer. f-strings let you inject expressions directly inside curly brackets {}."
      }
    ],
    practiceQuestion: {
      title: "Calculate BMI from Variables",
      description: "Define weight in kg and height in meters, compute BMI using weight / (height ** 2), and print the rounded result.",
      input: "weight = 70\nheight = 1.75\nbmi = weight / (height ** 2)\nprint(f\"Calculated BMI: {round(bmi, 2)}\")",
      output: "Calculated BMI: 22.86\n\n[Process finished with exit code 0]",
      explanation: "height ** 2 raises height to power 2. The formula calculates 70 / 3.0625 = 22.857, rounded to 22.86."
    },
    mcqs: [
      {
        id: "ch2-q1",
        question: "Which of the following variable names is INVALID in Python?",
        options: [
          "total_score",
          "_private_val",
          "2nd_station",
          "playerScore"
        ],
        correctAnswerIndex: 2,
        explanation: "Variable names in Python cannot begin with a digit. '2nd_station' triggers a SyntaxError."
      },
      {
        id: "ch2-q2",
        question: "What is the return value of type(99.0) in Python?",
        options: [
          "<class 'int'>",
          "<class 'float'>",
          "<class 'double'>",
          "<class 'decimal'>"
        ],
        correctAnswerIndex: 1,
        explanation: "Numbers containing a decimal point are stored as 'float' in Python. Python does not have a native 'double' keyword."
      },
      {
        id: "ch2-q3",
        question: "What will be printed when running this code?",
        codeSnippet: "x = \"10\"\ny = 5\nprint(int(x) * y)",
        options: [
          "\"1010101010\"",
          "50",
          "15",
          "TypeError: unsupported operand"
        ],
        correctAnswerIndex: 1,
        explanation: "int('10') casts the string to integer 10. Then 10 * 5 performs integer multiplication yielding 50."
      }
    ]
  },
  "ch-3": {
    chapterId: "ch-3",
    title: "Control Flow: if, elif, else",
    codeExamples: [
      {
        title: "Conditional Evaluation with if-elif-else",
        input: "score = 85\n\nif score >= 90:\n    grade = \"A\"\nelif score >= 75:\n    grade = \"B\"\nelif score >= 50:\n    grade = \"C\"\nelse:\n    grade = \"F\"\n\nprint(f\"Grade assigned: {grade}\")",
        output: "Grade assigned: B\n\n[Process finished with exit code 0]",
        explanation: "Python evaluates conditions sequentially. Because 85 is not >= 90 but is >= 75, the elif branch runs and sets grade to B."
      },
      {
        title: "Logical Operators: and / or / not",
        input: "has_key = True\nlevel = 5\n\nif has_key and level >= 5:\n    print(\"Portal opened successfully!\")\nelse:\n    print(\"Access denied.\")",
        output: "Portal opened successfully!\n\n[Process finished with exit code 0]",
        explanation: "The 'and' operator requires both conditions to be True for the branch to execute."
      }
    ],
    practiceQuestion: {
      title: "Check Even or Odd",
      description: "Given a number, check whether it is even or odd using the modulus operator (%) and print the outcome.",
      input: "number = 14\nif number % 2 == 0:\n    print(f\"{number} is Even\")\nelse:\n    print(f\"{number} is Odd\")",
      output: "14 is Even\n\n[Process finished with exit code 0]",
      explanation: "number % 2 computes remainder after division by 2. If remainder is 0, the number is divisible by 2 and thus even."
    },
    mcqs: [
      {
        id: "ch3-q1",
        question: "Which operator is used to compare whether two values are strictly equal in Python?",
        options: [
          "=",
          "==",
          "===",
          "equals"
        ],
        correctAnswerIndex: 1,
        explanation: "In Python, '=' is the assignment operator, while '==' tests equality. '===' does not exist in Python."
      },
      {
        id: "ch3-q2",
        question: "What will this condition evaluate to in Python?",
        codeSnippet: "x = 5\nprint(x > 2 and not (x == 5))",
        options: [
          "True",
          "False",
          "None",
          "SyntaxError"
        ],
        correctAnswerIndex: 1,
        explanation: "x > 2 is True, but (x == 5) is True, so not(x == 5) is False. True and False evaluates to False."
      },
      {
        id: "ch3-q3",
        question: "What must be placed at the end of an if, elif, or else line in Python?",
        options: [
          "A semicolon (;)",
          "A curly brace ({)",
          "A colon (:)",
          "A newline only without punctuation"
        ],
        correctAnswerIndex: 2,
        explanation: "In Python syntax, headers for compound statements (if, for, while, def, class) must terminate with a colon (:)."
      }
    ]
  },
  "ch-4": {
    chapterId: "ch-4",
    title: "Loops: for and while",
    codeExamples: [
      {
        title: "Iterating with for loop and range()",
        input: "for i in range(1, 4):\n    print(f\"Iteration #{i}\")",
        output: "Iteration #1\nIteration #2\nIteration #3\n\n[Process finished with exit code 0]",
        explanation: "range(1, 4) produces integers 1, 2, 3 (stopping strictly before 4). The loop iterates through each value."
      },
      {
        title: "Loop Control: break and continue",
        input: "for num in range(1, 6):\n    if num == 3:\n        continue\n    if num == 5:\n        break\n    print(num, end=\" \")",
        output: "1 2 4 \n\n[Process finished with exit code 0]",
        explanation: "'continue' skips the rest of the current iteration when num is 3. 'break' exits the loop when num reaches 5."
      }
    ],
    practiceQuestion: {
      title: "Sum of First N Natural Numbers",
      description: "Compute the sum of numbers from 1 to 5 using a loop.",
      input: "total = 0\nfor i in range(1, 6):\n    total += i\nprint(f\"Sum from 1 to 5 is: {total}\")",
      output: "Sum from 1 to 5 is: 15\n\n[Process finished with exit code 0]",
      explanation: "The loop adds 1 + 2 + 3 + 4 + 5 = 15."
    },
    mcqs: [
      {
        id: "ch4-q1",
        question: "What sequence of numbers does range(2, 6) produce?",
        options: [
          "2, 3, 4, 5, 6",
          "2, 3, 4, 5",
          "3, 4, 5, 6",
          "2, 4, 6"
        ],
        correctAnswerIndex: 1,
        explanation: "In Python, range(start, stop) starts at start (2) and stops before stop (6), producing 2, 3, 4, 5."
      },
      {
        id: "ch4-q2",
        question: "Which statement skips the current iteration and jumps directly to the next cycle of the loop?",
        options: [
          "break",
          "continue",
          "pass",
          "skip"
        ],
        correctAnswerIndex: 1,
        explanation: "The 'continue' statement stops execution of the current iteration and begins the next iteration of the loop."
      },
      {
        id: "ch4-q3",
        question: "What will be the output of this code?",
        codeSnippet: "count = 3\nwhile count > 0:\n    count -= 1\nprint(count)",
        options: [
          "3",
          "1",
          "0",
          "-1"
        ],
        correctAnswerIndex: 2,
        explanation: "count decrements from 3 to 2, 2 to 1, and 1 to 0. When count is 0, the loop condition count > 0 becomes False, and 0 is printed."
      }
    ]
  },
  "ch-5": {
    chapterId: "ch-5",
    title: "Lists & Collections",
    codeExamples: [
      {
        title: "Creating, Indexing, and Modifying Lists",
        input: "planets = [\"Mercury\", \"Venus\", \"Earth\"]\nplanets.append(\"Mars\")\nprint(\"First planet:\", planets[0])\nprint(\"Last planet:\", planets[-1])\nprint(\"Total count:\", len(planets))",
        output: "First planet: Mercury\nLast planet: Mars\nTotal count: 4\n\n[Process finished with exit code 0]",
        explanation: "Lists are 0-indexed. Negative index -1 accesses the final item. append() inserts an element at the end."
      }
    ],
    practiceQuestion: {
      title: "Find Maximum Element in List",
      description: "Find and display the highest score from a list of test scores.",
      input: "scores = [45, 88, 72, 95, 63]\nmax_val = max(scores)\nprint(f\"Highest score: {max_val}\")",
      output: "Highest score: 95\n\n[Process finished with exit code 0]",
      explanation: "The built-in max() function scans the list and returns the highest numerical value."
    },
    mcqs: [
      {
        id: "ch5-q1",
        question: "How do you access the first element of a list named 'items' in Python?",
        options: [
          "items(0)",
          "items[1]",
          "items[0]",
          "items.first()"
        ],
        correctAnswerIndex: 2,
        explanation: "Python uses square brackets [] with 0-based indexing to access list elements. items[0] references the first item."
      },
      {
        id: "ch5-q2",
        question: "What does the list method items.pop() do when called without arguments?",
        options: [
          "Removes and returns the first element",
          "Removes and returns the last element",
          "Deletes all elements from the list",
          "Sorts the list in ascending order"
        ],
        correctAnswerIndex: 1,
        explanation: "pop() removes and returns the item at the given index; if no index is specified, it removes and returns the last item in the list."
      }
    ]
  },
  "ch-6": {
    chapterId: "ch-6",
    title: "Functions & Parameters",
    codeExamples: [
      {
        title: "Defining Functions with Return Values",
        input: "def calculate_power(base, exponent=2):\n    return base ** exponent\n\nprint(\"Square of 5:\", calculate_power(5))\nprint(\"Cube of 3:\", calculate_power(3, 3))",
        output: "Square of 5: 25\nCube of 3: 27\n\n[Process finished with exit code 0]",
        explanation: "Functions are declared using 'def'. Default parameters allow omitting arguments when calling the function."
      }
    ],
    practiceQuestion: {
      title: "Calculate Circle Area Function",
      description: "Create a function circle_area(radius) that computes 3.14159 * radius ** 2 and returns it.",
      input: "def circle_area(r):\n    return 3.14159 * (r ** 2)\n\nprint(\"Area for radius 4:\", round(circle_area(4), 2))",
      output: "Area for radius 4: 50.27\n\n[Process finished with exit code 0]",
      explanation: "Calling circle_area(4) computes 3.14159 * 16 = 50.26544, rounded to 50.27."
    },
    mcqs: [
      {
        id: "ch6-q1",
        question: "Which keyword is used to declare a function in Python?",
        options: [
          "function",
          "def",
          "func",
          "fn"
        ],
        correctAnswerIndex: 1,
        explanation: "Python uses the 'def' keyword (short for define) to start a function definition."
      },
      {
        id: "ch6-q2",
        question: "What value does a Python function return if it executes without reaching a return statement?",
        options: [
          "0",
          "False",
          "None",
          "undefined"
        ],
        correctAnswerIndex: 2,
        explanation: "In Python, any function that finishes execution without returning an explicit value automatically returns None."
      }
    ]
  },
  "ch-7": {
    chapterId: "ch-7",
    title: "Object-Oriented Programming (Classes)",
    codeExamples: [
      {
        title: "Class Definition and Constructor",
        input: "class Rocket:\n    def __init__(self, name, fuel):\n        self.name = name\n        self.fuel = fuel\n\n    def launch(self):\n        return f\"{self.name} launched with {self.fuel}% fuel!\"\n\nship = Rocket(\"Cosmo-1\", 100)\nprint(ship.launch())",
        output: "Cosmo-1 launched with 100% fuel!\n\n[Process finished with exit code 0]",
        explanation: "The __init__ method initializes new class instances. 'self' binds instance attributes to the specific object."
      }
    ],
    practiceQuestion: {
      title: "Create Player Class",
      description: "Create a Player class with name and score attributes, and a method get_badge() returning 'PRO' if score >= 100 else 'NOVICE'.",
      input: "class Player:\n    def __init__(self, name, score):\n        self.name = name\n        self.score = score\n    def get_badge(self):\n        return \"PRO\" if self.score >= 100 else \"NOVICE\"\n\np = Player(\"Rishi\", 150)\nprint(f\"{p.name}: {p.get_badge()}\")",
      output: "Rishi: PRO\n\n[Process finished with exit code 0]",
      explanation: "The get_badge() method checks self.score and returns PRO."
    },
    mcqs: [
      {
        id: "ch7-q1",
        question: "What is the name of the constructor method automatically invoked when instantiating a new object in Python?",
        options: [
          "__start__()",
          "__create__()",
          "__init__()",
          "__new__()"
        ],
        correctAnswerIndex: 2,
        explanation: "The __init__() method acts as the initializer/constructor in Python classes, configuring object state."
      },
      {
        id: "ch7-q2",
        question: "What does the first parameter 'self' represent inside an instance method?",
        options: [
          "The parent class of the instance",
          "The current object instance being called",
          "A global reference to the Python interpreter",
          "The method itself"
        ],
        correctAnswerIndex: 1,
        explanation: "'self' represents the instance of the class through which the method was invoked, enabling access to its attributes."
      }
    ]
  },
  "ch-8": {
    chapterId: "ch-8",
    title: "Modules & Packages",
    codeExamples: [
      {
        title: "Importing and Using Built-in Modules",
        input: "import math\n\nradius = 5\narea = math.pi * (radius ** 2)\nprint(f\"Circle Area: {area:.2f}\")\nprint(\"Square root of 64:\", math.sqrt(64))",
        output: "Circle Area: 78.54\nSquare root of 64: 8.0\n\n[Process finished with exit code 0]",
        explanation: "The math module supplies mathematical constants like math.pi and functions like math.sqrt()."
      }
    ],
    practiceQuestion: {
      title: "Generate Deterministic Calculation",
      description: "Import math and calculate the ceiling value of 14.2 and the floor value of 14.9.",
      input: "import math\nval = 14.2\nprint(\"Ceil:\", math.ceil(val))\nprint(\"Floor:\", math.floor(14.9))",
      output: "Ceil: 15\nFloor: 14\n\n[Process finished with exit code 0]",
      explanation: "math.ceil() rounds up to next whole integer (15), while math.floor() rounds down (14)."
    },
    mcqs: [
      {
        id: "ch8-q1",
        question: "Which built-in module is used to generate pseudo-random numbers in Python?",
        options: [
          "math",
          "random",
          "calc",
          "sys"
        ],
        correctAnswerIndex: 1,
        explanation: "The 'random' module provides functions like random.randint(), random.choice(), and random.random()."
      },
      {
        id: "ch8-q2",
        question: "Which syntax imports ONLY the sqrt function from the math module?",
        options: [
          "import sqrt from math",
          "from math import sqrt",
          "using math.sqrt",
          "include math:sqrt"
        ],
        correctAnswerIndex: 1,
        explanation: "The 'from module import function' syntax imports specific identifiers into the current namespace directly."
      }
    ]
  }
};

export function getQuizForChapter(chapterKey: string): ChapterQuizData {
  const normalized = (chapterKey || "").toLowerCase().replace("station-", "").replace("station", "");
  
  if (normalized.includes("in-the-beginning") || normalized.includes("hello") || normalized.includes("1")) {
    return PYTHON_CHAPTERS_QUIZ_DATA["ch-1"];
  }
  if (normalized.includes("var") || normalized.includes("2")) {
    return PYTHON_CHAPTERS_QUIZ_DATA["ch-2"];
  }
  if (normalized.includes("control") || normalized.includes("flow") || normalized.includes("3")) {
    return PYTHON_CHAPTERS_QUIZ_DATA["ch-3"];
  }
  if (normalized.includes("loop") || normalized.includes("4")) {
    return PYTHON_CHAPTERS_QUIZ_DATA["ch-4"];
  }
  if (normalized.includes("list") || normalized.includes("5")) {
    return PYTHON_CHAPTERS_QUIZ_DATA["ch-5"];
  }
  if (normalized.includes("func") || normalized.includes("6")) {
    return PYTHON_CHAPTERS_QUIZ_DATA["ch-6"];
  }
  if (normalized.includes("class") || normalized.includes("7")) {
    return PYTHON_CHAPTERS_QUIZ_DATA["ch-7"];
  }
  if (normalized.includes("modul") || normalized.includes("8")) {
    return PYTHON_CHAPTERS_QUIZ_DATA["ch-8"];
  }

  return PYTHON_CHAPTERS_QUIZ_DATA["ch-1"];
}
