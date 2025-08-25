import { detectLanguage, type LanguageDetectionResult } from '@/lib/language-detector';

export interface MessageIntent {
  shouldGenerateCode: boolean;
  intent: 'greeting' | 'question' | 'code_request' | 'command' | 'general' | 'clarification';
  confidence: number;
  response?: string;
  detectedLanguage?: string;
  languagePreferences?: string[];
}

export class MessageClassifier {
  // Cursor AI style greetings and human-like conversation patterns
  private static greetings = [
    // Basic greetings
    'hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening',
    'howdy', 'sup', 'what\'s up', 'yo', 'greetings', 'salutations',
    'good day', 'morning', 'afternoon', 'evening', 'goodbye', 'bye', 'see you',
    
    // Cursor AI style greetings
    'hey there', 'hi there', 'hello there', 'good morning there', 'good afternoon there',
    'what\'s going on', 'how\'s it going', 'how are you', 'how are you doing',
    'nice to meet you', 'pleasure to meet you', 'great to see you', 'good to see you',
    'welcome back', 'welcome', 'hi again', 'hello again', 'hey again',
    'good to have you here', 'nice to have you here', 'welcome aboard',
    'hello friend', 'hi friend', 'hey friend', 'hello buddy', 'hi buddy', 'hey buddy',
    'hello mate', 'hi mate', 'hey mate', 'hello pal', 'hi pal', 'hey pal',
    'hello there', 'hi there', 'hey there', 'hello you', 'hi you', 'hey you',
    
    // Casual and modern greetings
    'yo', 'yoo', 'yooo', 'yoooo', 'sup', 'whatsup', 'what\'s up', 'wassup', 'wasssup',
    'hey yo', 'hi yo', 'hello yo', 'yo there', 'yo buddy', 'yo friend', 'yo mate',
    'hey man', 'hi man', 'hello man', 'hey dude', 'hi dude', 'hello dude',
    'hey girl', 'hi girl', 'hello girl', 'hey bro', 'hi bro', 'hello bro',
    'hey sis', 'hi sis', 'hello sis', 'hey fam', 'hi fam', 'hello fam',
    
    // Professional greetings
    'good morning sir', 'good morning ma\'am', 'good afternoon sir', 'good afternoon ma\'am',
    'good evening sir', 'good evening ma\'am', 'hello sir', 'hello ma\'am',
    'hi sir', 'hi ma\'am', 'hey sir', 'hey ma\'am',
    
    // Time-based greetings
    'good morning everyone', 'good afternoon everyone', 'good evening everyone',
    'hello everyone', 'hi everyone', 'hey everyone', 'good morning all',
    'good afternoon all', 'good evening all', 'hello all', 'hi all', 'hey all',
    
    // Farewells
    'goodbye', 'bye', 'see you', 'see ya', 'see you later', 'see ya later',
    'take care', 'take it easy', 'have a good one', 'have a great day',
    'have a wonderful day', 'have a nice day', 'have a good evening',
    'have a good night', 'good night', 'night', 'goodbye for now',
    'see you soon', 'see you around', 'catch you later', 'talk to you later',
    'until next time', 'until we meet again', 'farewell', 'adios', 'ciao',
    'au revoir', 'auf wiedersehen', 'arrivederci', 'sayonara', 'goodbye friend',
    'bye friend', 'see you friend', 'goodbye buddy', 'bye buddy', 'see you buddy',
    'goodbye mate', 'bye mate', 'see you mate', 'goodbye pal', 'bye pal', 'see you pal'
  ];

  // Cursor AI style questions and human-like conversation patterns
  private static questions = [
    // Basic question words
    'what', 'how', 'why', 'when', 'where', 'who', 'which', 'can you', 'could you',
    'would you', 'do you', 'are you', 'is it', 'does it', 'will it', 'should i',
    'can i', 'could i', 'would i', 'help', 'explain', 'tell me', 'show me',
    'i need help', 'i want to', 'i would like to', 'i am trying to', 'i want to know',
    'i don\'t understand', 'i\'m confused', 'i\'m stuck', 'i need assistance',
    'can you help me', 'could you help me', 'would you help me', 'please help',
    'i need guidance', 'i need advice', 'i need suggestions', 'i need recommendations',
    'what is', 'how do', 'why does', 'when should', 'where can', 'who can',
    'which one', 'can i', 'could i', 'would i', 'should i', 'do i', 'am i',
    'is this', 'does this', 'will this', 'are there', 'is there', 'does there',
    'what are', 'how are', 'why are', 'when are', 'where are', 'who are',
    'which are', 'can we', 'could we', 'would we', 'should we', 'do we',
    'what does', 'how does', 'why do', 'when do', 'where do', 'who do',
    'which do', 'can they', 'could they', 'would they', 'should they', 'do they',
    
    // Cursor AI style questions and requests
    'i was wondering', 'i wonder', 'i\'m wondering', 'i\'ve been wondering',
    'i\'d like to know', 'i want to know', 'i need to know', 'i have to know',
    'i\'m curious about', 'i\'m curious to know', 'i\'m curious if', 'i\'m curious whether',
    'i\'m interested in', 'i\'m interested to know', 'i\'m interested if', 'i\'m interested whether',
    'i\'d be interested in', 'i\'d be interested to know', 'i\'d be interested if', 'i\'d be interested whether',
    'i\'d love to know', 'i\'d love to learn', 'i\'d love to understand', 'i\'d love to see',
    'i\'d really like to know', 'i\'d really like to learn', 'i\'d really like to understand',
    'i\'d really like to see', 'i\'d really love to know', 'i\'d really love to learn',
    'i\'d really love to understand', 'i\'d really love to see',
    
    // Human-like conversation patterns
    'you know what', 'you know', 'you see', 'you see what i mean', 'you know what i mean',
    'if you know what i mean', 'if you see what i mean', 'you get what i mean',
    'you understand what i mean', 'you follow what i mean', 'you catch what i mean',
    'i mean', 'i mean like', 'i mean you know', 'i mean you see', 'i mean you know what i mean',
    'like', 'like you know', 'like you see', 'like i mean', 'like i said',
    'you know like', 'you see like', 'i mean like', 'like i mean like',
    
    // Cursor AI style help requests
    'i need some help', 'i need a little help', 'i need a bit of help', 'i need some assistance',
    'i need a little assistance', 'i need a bit of assistance', 'i need some guidance',
    'i need a little guidance', 'i need a bit of guidance', 'i need some advice',
    'i need a little advice', 'i need a bit of advice', 'i need some suggestions',
    'i need a little suggestions', 'i need a bit of suggestions', 'i need some recommendations',
    'i need a little recommendations', 'i need a bit of recommendations',
    
    // Cursor AI style clarification requests
    'i\'m not sure', 'i\'m not sure about', 'i\'m not sure if', 'i\'m not sure whether',
    'i\'m not certain', 'i\'m not certain about', 'i\'m not certain if', 'i\'m not certain whether',
    'i\'m not clear', 'i\'m not clear about', 'i\'m not clear if', 'i\'m not clear whether',
    'i\'m confused about', 'i\'m confused if', 'i\'m confused whether', 'i\'m puzzled about',
    'i\'m puzzled if', 'i\'m puzzled whether', 'i\'m baffled about', 'i\'m baffled if',
    'i\'m baffled whether', 'i\'m stumped about', 'i\'m stumped if', 'i\'m stumped whether',
    
    // Cursor AI style learning requests
    'i want to learn', 'i\'d like to learn', 'i need to learn', 'i have to learn',
    'i want to understand', 'i\'d like to understand', 'i need to understand', 'i have to understand',
    'i want to figure out', 'i\'d like to figure out', 'i need to figure out', 'i have to figure out',
    'i want to work out', 'i\'d like to work out', 'i need to work out', 'i have to work out',
    'i want to find out', 'i\'d like to find out', 'i need to find out', 'i have to find out',
    
    // Cursor AI style exploration requests
    'i want to explore', 'i\'d like to explore', 'i need to explore', 'i have to explore',
    'i want to investigate', 'i\'d like to investigate', 'i need to investigate', 'i have to investigate',
    'i want to research', 'i\'d like to research', 'i need to research', 'i have to research',
    'i want to look into', 'i\'d like to look into', 'i need to look into', 'i have to look into',
    'i want to check out', 'i\'d like to check out', 'i need to check out', 'i have to check out',
    
    // Cursor AI style demonstration requests
    'can you show me', 'could you show me', 'would you show me', 'will you show me',
    'can you demonstrate', 'could you demonstrate', 'would you demonstrate', 'will you demonstrate',
    'can you give me an example', 'could you give me an example', 'would you give me an example',
    'will you give me an example', 'can you show me an example', 'could you show me an example',
    'would you show me an example', 'will you show me an example',
    
    // Cursor AI style explanation requests
    'can you explain', 'could you explain', 'would you explain', 'will you explain',
    'can you tell me', 'could you tell me', 'would you tell me', 'will you tell me',
    'can you describe', 'could you describe', 'would you describe', 'will you describe',
    'can you walk me through', 'could you walk me through', 'would you walk me through',
    'will you walk me through', 'can you guide me through', 'could you guide me through',
    'would you guide me through', 'will you guide me through',
    
    // Cursor AI style comparison requests
    'what\'s the difference between', 'what are the differences between', 'how do they differ',
    'how are they different', 'what distinguishes', 'what separates', 'what sets apart',
    'can you compare', 'could you compare', 'would you compare', 'will you compare',
    'can you contrast', 'could you contrast', 'would you contrast', 'will you contrast',
    
    // Cursor AI style opinion requests
    'what do you think', 'what do you think about', 'what\'s your opinion', 'what\'s your opinion on',
    'what\'s your take', 'what\'s your take on', 'what\'s your view', 'what\'s your view on',
    'what\'s your perspective', 'what\'s your perspective on', 'what\'s your stance', 'what\'s your stance on',
    'what do you recommend', 'what would you recommend', 'what do you suggest', 'what would you suggest',
    'what do you advise', 'what would you advise', 'what do you propose', 'what would you propose',
    
    // Cursor AI style preference requests
    'what do you prefer', 'what would you prefer', 'what do you like better', 'what do you like more',
    'what\'s your preference', 'what\'s your favorite', 'what\'s your top choice', 'what\'s your best choice',
    'what do you recommend', 'what would you recommend', 'what do you suggest', 'what would you suggest',
    'what do you think is best', 'what do you think is better', 'what do you think is the best',
    'what do you think is the better', 'what do you think is the top', 'what do you think is the favorite',
    
    // Cursor AI style future requests
    'what will happen', 'what\'s going to happen', 'what\'s going to be', 'what\'s going to become',
    'what\'s going to change', 'what\'s going to develop', 'what\'s going to evolve', 'what\'s going to grow',
    'what\'s going to improve', 'what\'s going to progress', 'what\'s going to advance', 'what\'s going to move forward',
    'what\'s going to move ahead', 'what\'s going to move on', 'what\'s going to move up', 'what\'s going to move forward',
    
    // Cursor AI style past requests
    'what happened', 'what\'s happened', 'what did happen', 'what has happened',
    'what was', 'what has been', 'what had been', 'what would have been',
    'what could have been', 'what might have been', 'what should have been', 'what ought to have been',
    'what was going to be', 'what was going to happen', 'what was going to become', 'what was going to change',
    
    // Cursor AI style current requests
    'what is happening', 'what\'s happening', 'what\'s going on', 'what\'s occurring',
    'what\'s taking place', 'what\'s going down', 'what\'s going up', 'what\'s going around',
    'what\'s going through', 'what\'s going over', 'what\'s going under', 'what\'s going above',
    'what\'s going below', 'what\'s going inside', 'what\'s going outside', 'what\'s going in',
    'what\'s going out', 'what\'s going here', 'what\'s going there', 'what\'s going everywhere',
    
    // Cursor AI style possibility requests
    'what could happen', 'what might happen', 'what may happen', 'what should happen',
    'what ought to happen', 'what needs to happen', 'what has to happen', 'what must happen',
    'what will happen if', 'what would happen if', 'what could happen if', 'what might happen if',
    'what may happen if', 'what should happen if', 'what ought to happen if', 'what needs to happen if',
    'what has to happen if', 'what must happen if',
    
    // Cursor AI style condition requests
    'what if', 'what would happen if', 'what could happen if', 'what might happen if',
    'what may happen if', 'what should happen if', 'what ought to happen if', 'what needs to happen if',
    'what has to happen if', 'what must happen if', 'what will happen if', 'what is going to happen if',
    'what\'s going to happen if', 'what\'s going to be if', 'what\'s going to become if', 'what\'s going to change if',
    
    // Cursor AI style reason requests
    'why is this', 'why is that', 'why is it', 'why are they', 'why are we', 'why are you',
    'why do you', 'why does it', 'why does that', 'why does this', 'why do they', 'why do we',
    'why would you', 'why would it', 'why would that', 'why would this', 'why would they', 'why would we',
    'why could you', 'why could it', 'why could that', 'why could this', 'why could they', 'why could we',
    'why might you', 'why might it', 'why might that', 'why might this', 'why might they', 'why might we',
    'why may you', 'why may it', 'why may that', 'why may this', 'why may they', 'why may we',
    'why should you', 'why should it', 'why should that', 'why should this', 'why should they', 'why should we',
    'why ought you', 'why ought it', 'why ought that', 'why ought this', 'why ought they', 'why ought we',
    'why need you', 'why need it', 'why need that', 'why need this', 'why need they', 'why need we',
    'why have you', 'why have it', 'why have that', 'why have this', 'why have they', 'why have we',
    'why must you', 'why must it', 'why must that', 'why must this', 'why must they', 'why must we'
  ];

  // Language detection keywords
  private static languageKeywords = [
    // Programming languages
    'javascript', 'js', 'typescript', 'ts', 'python', 'py', 'java', 'c#', 'csharp', 'cpp', 'c++', 'c',
    'php', 'ruby', 'rb', 'go', 'golang', 'rust', 'swift', 'kotlin', 'dart', 'scala', 'groovy',
    'perl', 'r', 'matlab', 'octave', 'bash', 'shell', 'powershell', 'batch', 'bat',
    'html', 'css', 'scss', 'sass', 'less', 'stylus', 'xml', 'json', 'yaml', 'toml',
    'sql', 'mysql', 'postgresql', 'sqlite', 'mongodb', 'redis', 'graphql',
    'assembly', 'asm', 'fortran', 'cobol', 'pascal', 'delphi', 'basic', 'vb', 'vb.net',
    'lua', 'haskell', 'erlang', 'elixir', 'clojure', 'f#', 'fsharp', 'ocaml', 'nim',
    'zig', 'v', 'crystal', 'julia', 'd', 'ada', 'prolog', 'lisp', 'scheme', 'racket',
    
    // Language-specific frameworks
    'react', 'vue', 'angular', 'svelte', 'next.js', 'nuxt', 'gatsby', 'remix',
    'django', 'flask', 'fastapi', 'spring', 'laravel', 'rails', 'express', 'koa',
    'gin', 'echo', 'actix', 'rocket', 'blazor', 'asp.net', 'dotnet', '.net',
    'flutter', 'react native', 'xamarin', 'ionic', 'cordova', 'electron', 'tauri',
    
    // Language preferences
    'in javascript', 'in typescript', 'in python', 'in java', 'in c#', 'in c++',
    'using javascript', 'using typescript', 'using python', 'using java', 'using c#',
    'with javascript', 'with typescript', 'with python', 'with java', 'with c#',
    'javascript version', 'typescript version', 'python version', 'java version',
    'js code', 'ts code', 'py code', 'java code', 'c# code', 'cpp code',
    'vanilla javascript', 'pure javascript', 'node.js', 'nodejs', 'deno',
    'es6', 'es2015', 'es2016', 'es2017', 'es2018', 'es2019', 'es2020', 'es2021', 'es2022',
    'modern javascript', 'latest javascript', 'newest javascript',
    'python 3', 'python3', 'python 2', 'python2', 'py3', 'py2',
    'java 8', 'java 11', 'java 17', 'java 21', 'jdk', 'jre',
    'c# 9', 'c# 10', 'c# 11', 'c# 12', 'dotnet 6', 'dotnet 7', 'dotnet 8',
    'c++ 17', 'c++ 20', 'c++ 23', 'modern c++', 'cpp17', 'cpp20', 'cpp23',
    
    // Enhanced language detection patterns
    'javascript project', 'typescript project', 'python project', 'java project', 'c# project',
    'c++ project', 'php project', 'ruby project', 'go project', 'rust project', 'swift project',
    'kotlin project', 'dart project', 'html project', 'css project', 'sql project', 'scala project',
    'r project', 'matlab project', 'julia project', 'haskell project', 'clojure project',
    'elixir project', 'erlang project', 'f# project', 'ocaml project', 'nim project',
    'crystal project', 'zig project', 'v project', 'odin project', 'vlang project',
    
    // Language-specific app patterns
    'javascript app', 'typescript app', 'python app', 'java app', 'c# app', 'c++ app',
    'php app', 'ruby app', 'go app', 'rust app', 'swift app', 'kotlin app', 'dart app',
    'html app', 'css app', 'sql app', 'scala app', 'r app', 'matlab app', 'julia app',
    'haskell app', 'clojure app', 'elixir app', 'erlang app', 'f# app', 'ocaml app',
    'nim app', 'crystal app', 'zig app', 'v app', 'odin app', 'vlang app',
    
    // Language-specific application patterns
    'javascript application', 'typescript application', 'python application', 'java application',
    'c# application', 'c++ application', 'php application', 'ruby application', 'go application',
    'rust application', 'swift application', 'kotlin application', 'dart application',
    'html application', 'css application', 'sql application', 'scala application', 'r application',
    'matlab application', 'julia application', 'haskell application', 'clojure application',
    'elixir application', 'erlang application', 'f# application', 'ocaml application',
    'nim application', 'crystal application', 'zig application', 'v application',
    'odin application', 'vlang application',
    
    // Language-specific code patterns
    'javascript code', 'typescript code', 'python code', 'java code', 'c# code', 'c++ code',
    'php code', 'ruby code', 'go code', 'rust code', 'swift code', 'kotlin code', 'dart code',
    'html code', 'css code', 'sql code', 'scala code', 'r code', 'matlab code', 'julia code',
    'haskell code', 'clojure code', 'elixir code', 'erlang code', 'f# code', 'ocaml code',
    'nim code', 'crystal code', 'zig code', 'v code', 'odin code', 'vlang code',
    
    // Language-specific website patterns
    'javascript website', 'typescript website', 'python website', 'java website', 'c# website',
    'c++ website', 'php website', 'ruby website', 'go website', 'rust website', 'swift website',
    'kotlin website', 'dart website', 'html website', 'css website', 'sql website', 'scala website',
    'r website', 'matlab website', 'julia website', 'haskell website', 'clojure website',
    'elixir website', 'erlang website', 'f# website', 'ocaml website', 'nim website',
    'crystal website', 'zig website', 'v website', 'odin website', 'vlang website',
    
    // Language-specific webapp patterns
    'javascript webapp', 'typescript webapp', 'python webapp', 'java webapp', 'c# webapp',
    'c++ webapp', 'php webapp', 'ruby webapp', 'go webapp', 'rust webapp', 'swift webapp',
    'kotlin webapp', 'dart webapp', 'html webapp', 'css webapp', 'sql webapp', 'scala webapp',
    'r webapp', 'matlab webapp', 'julia webapp', 'haskell webapp', 'clojure webapp',
    'elixir webapp', 'erlang webapp', 'f# webapp', 'ocaml webapp', 'nim webapp',
    'crystal webapp', 'zig webapp', 'v webapp', 'odin webapp', 'vlang webapp',
    
    // Language-specific portfolio patterns
    'javascript portfolio', 'typescript portfolio', 'python portfolio', 'java portfolio', 'c# portfolio',
    'c++ portfolio', 'php portfolio', 'ruby portfolio', 'go portfolio', 'rust portfolio', 'swift portfolio',
    'kotlin portfolio', 'dart portfolio', 'html portfolio', 'css portfolio', 'sql portfolio', 'scala portfolio',
    'r portfolio', 'matlab portfolio', 'julia portfolio', 'haskell portfolio', 'clojure portfolio',
    'elixir portfolio', 'erlang portfolio', 'f# portfolio', 'ocaml portfolio', 'nim portfolio',
    'crystal portfolio', 'zig portfolio', 'v portfolio', 'odin portfolio', 'vlang portfolio',
    
    // Language-specific landing page patterns
    'javascript landing page', 'typescript landing page', 'python landing page', 'java landing page',
    'c# landing page', 'c++ landing page', 'php landing page', 'ruby landing page', 'go landing page',
    'rust landing page', 'swift landing page', 'kotlin landing page', 'dart landing page',
    'html landing page', 'css landing page', 'sql landing page', 'scala landing page', 'r landing page',
    'matlab landing page', 'julia landing page', 'haskell landing page', 'clojure landing page',
    'elixir landing page', 'erlang landing page', 'f# landing page', 'ocaml landing page',
    'nim landing page', 'crystal landing page', 'zig landing page', 'v landing page',
    'odin landing page', 'vlang landing page',
    
    // Language-specific blog patterns
    'javascript blog', 'typescript blog', 'python blog', 'java blog', 'c# blog', 'c++ blog',
    'php blog', 'ruby blog', 'go blog', 'rust blog', 'swift blog', 'kotlin blog', 'dart blog',
    'html blog', 'css blog', 'sql blog', 'scala blog', 'r blog', 'matlab blog', 'julia blog',
    'haskell blog', 'clojure blog', 'elixir blog', 'erlang blog', 'f# blog', 'ocaml blog',
    'nim blog', 'crystal blog', 'zig blog', 'v blog', 'odin blog', 'vlang blog',
    
    // Language-specific ecommerce patterns
    'javascript ecommerce', 'typescript ecommerce', 'python ecommerce', 'java ecommerce', 'c# ecommerce',
    'c++ ecommerce', 'php ecommerce', 'ruby ecommerce', 'go ecommerce', 'rust ecommerce', 'swift ecommerce',
    'kotlin ecommerce', 'dart ecommerce', 'html ecommerce', 'css ecommerce', 'sql ecommerce', 'scala ecommerce',
    'r ecommerce', 'matlab ecommerce', 'julia ecommerce', 'haskell ecommerce', 'clojure ecommerce',
    'elixir ecommerce', 'erlang ecommerce', 'f# ecommerce', 'ocaml ecommerce', 'nim ecommerce',
    'crystal ecommerce', 'zig ecommerce', 'v ecommerce', 'odin ecommerce', 'vlang ecommerce',
    
    // Language-specific dashboard patterns
    'javascript dashboard', 'typescript dashboard', 'python dashboard', 'java dashboard', 'c# dashboard',
    'c++ dashboard', 'php dashboard', 'ruby dashboard', 'go dashboard', 'rust dashboard', 'swift dashboard',
    'kotlin dashboard', 'dart dashboard', 'html dashboard', 'css dashboard', 'sql dashboard', 'scala dashboard',
    'r dashboard', 'matlab dashboard', 'julia dashboard', 'haskell dashboard', 'clojure dashboard',
    'elixir dashboard', 'erlang dashboard', 'f# dashboard', 'ocaml dashboard', 'nim dashboard',
    'crystal dashboard', 'zig dashboard', 'v dashboard', 'odin dashboard', 'vlang dashboard',
    
    // Language-specific api patterns
    'javascript api', 'typescript api', 'python api', 'java api', 'c# api', 'c++ api',
    'php api', 'ruby api', 'go api', 'rust api', 'swift api', 'kotlin api', 'dart api',
    'html api', 'css api', 'sql api', 'scala api', 'r api', 'matlab api', 'julia api',
    'haskell api', 'clojure api', 'elixir api', 'erlang api', 'f# api', 'ocaml api',
    'nim api', 'crystal api', 'zig api', 'v api', 'odin api', 'vlang api',
    
    // Language-specific rest api patterns
    'javascript rest api', 'typescript rest api', 'python rest api', 'java rest api', 'c# rest api',
    'c++ rest api', 'php rest api', 'ruby rest api', 'go rest api', 'rust rest api', 'swift rest api',
    'kotlin rest api', 'dart rest api', 'html rest api', 'css rest api', 'sql rest api', 'scala rest api',
    'r rest api', 'matlab rest api', 'julia rest api', 'haskell rest api', 'clojure rest api',
    'elixir rest api', 'erlang rest api', 'f# rest api', 'ocaml rest api', 'nim rest api',
    'crystal rest api', 'zig rest api', 'v rest api', 'odin rest api', 'vlang rest api',
    
    // Language-specific graphql patterns
    'javascript graphql', 'typescript graphql', 'python graphql', 'java graphql', 'c# graphql',
    'c++ graphql', 'php graphql', 'ruby graphql', 'go graphql', 'rust graphql', 'swift graphql',
    'kotlin graphql', 'dart graphql', 'html graphql', 'css graphql', 'sql graphql', 'scala graphql',
    'r graphql', 'matlab graphql', 'julia graphql', 'haskell graphql', 'clojure graphql',
    'elixir graphql', 'erlang graphql', 'f# graphql', 'ocaml graphql', 'nim graphql',
    'crystal graphql', 'zig graphql', 'v graphql', 'odin graphql', 'vlang graphql',
    
    // Language-specific database patterns
    'javascript database', 'typescript database', 'python database', 'java database', 'c# database',
    'c++ database', 'php database', 'ruby database', 'go database', 'rust database', 'swift database',
    'kotlin database', 'dart database', 'html database', 'css database', 'sql database', 'scala database',
    'r database', 'matlab database', 'julia database', 'haskell database', 'clojure database',
    'elixir database', 'erlang database', 'f# database', 'ocaml database', 'nim database',
    'crystal database', 'zig database', 'v database', 'odin database', 'vlang database',
    
    // Language-specific authentication patterns
    'javascript authentication', 'typescript authentication', 'python authentication', 'java authentication',
    'c# authentication', 'c++ authentication', 'php authentication', 'ruby authentication', 'go authentication',
    'rust authentication', 'swift authentication', 'kotlin authentication', 'dart authentication',
    'html authentication', 'css authentication', 'sql authentication', 'scala authentication', 'r authentication',
    'matlab authentication', 'julia authentication', 'haskell authentication', 'clojure authentication',
    'elixir authentication', 'erlang authentication', 'f# authentication', 'ocaml authentication',
    'nim authentication', 'crystal authentication', 'zig authentication', 'v authentication',
    'odin authentication', 'vlang authentication',
    
    // Language-specific ui patterns
    'javascript ui', 'typescript ui', 'python ui', 'java ui', 'c# ui', 'c++ ui',
    'php ui', 'ruby ui', 'go ui', 'rust ui', 'swift ui', 'kotlin ui', 'dart ui',
    'html ui', 'css ui', 'sql ui', 'scala ui', 'r ui', 'matlab ui', 'julia ui',
    'haskell ui', 'clojure ui', 'elixir ui', 'erlang ui', 'f# ui', 'ocaml ui',
    'nim ui', 'crystal ui', 'zig ui', 'v ui', 'odin ui', 'vlang ui',
    
    // Language-specific ux patterns
    'javascript ux', 'typescript ux', 'python ux', 'java ux', 'c# ux', 'c++ ux',
    'php ux', 'ruby ux', 'go ux', 'rust ux', 'swift ux', 'kotlin ux', 'dart ux',
    'html ux', 'css ux', 'sql ux', 'scala ux', 'r ux', 'matlab ux', 'julia ux',
    'haskell ux', 'clojure ux', 'elixir ux', 'erlang ux', 'f# ux', 'ocaml ux',
    'nim ux', 'crystal ux', 'zig ux', 'v ux', 'odin ux', 'vlang ux',
    
    // Language-specific design patterns
    'javascript design', 'typescript design', 'python design', 'java design', 'c# design', 'c++ design',
    'php design', 'ruby design', 'go design', 'rust design', 'swift design', 'kotlin design', 'dart design',
    'html design', 'css design', 'sql design', 'scala design', 'r design', 'matlab design', 'julia design',
    'haskell design', 'clojure design', 'elixir design', 'erlang design', 'f# design', 'ocaml design',
    'nim design', 'crystal design', 'zig design', 'v design', 'odin design', 'vlang design',
    
    // Language-specific component patterns
    'javascript component', 'typescript component', 'python component', 'java component', 'c# component',
    'c++ component', 'php component', 'ruby component', 'go component', 'rust component', 'swift component',
    'kotlin component', 'dart component', 'html component', 'css component', 'sql component', 'scala component',
    'r component', 'matlab component', 'julia component', 'haskell component', 'clojure component',
    'elixir component', 'erlang component', 'f# component', 'ocaml component', 'nim component',
    'crystal component', 'zig component', 'v component', 'odin component', 'vlang component',
    
    // Language-specific feature patterns
    'javascript feature', 'typescript feature', 'python feature', 'java feature', 'c# feature', 'c++ feature',
    'php feature', 'ruby feature', 'go feature', 'rust feature', 'swift feature', 'kotlin feature', 'dart feature',
    'html feature', 'css feature', 'sql feature', 'scala feature', 'r feature', 'matlab feature', 'julia feature',
    'haskell feature', 'clojure feature', 'elixir feature', 'erlang feature', 'f# feature', 'ocaml feature',
    'nim feature', 'crystal feature', 'zig feature', 'v feature', 'odin feature', 'vlang feature',
    
    // Language-specific functionality patterns
    'javascript functionality', 'typescript functionality', 'python functionality', 'java functionality',
    'c# functionality', 'c++ functionality', 'php functionality', 'ruby functionality', 'go functionality',
    'rust functionality', 'swift functionality', 'kotlin functionality', 'dart functionality',
    'html functionality', 'css functionality', 'sql functionality', 'scala functionality', 'r functionality',
    'matlab functionality', 'julia functionality', 'haskell functionality', 'clojure functionality',
    'elixir functionality', 'erlang functionality', 'f# functionality', 'ocaml functionality',
    'nim functionality', 'crystal functionality', 'zig functionality', 'v functionality',
    'odin functionality', 'vlang functionality',
    
    // Language-specific capability patterns
    'javascript capability', 'typescript capability', 'python capability', 'java capability', 'c# capability',
    'c++ capability', 'php capability', 'ruby capability', 'go capability', 'rust capability', 'swift capability',
    'kotlin capability', 'dart capability', 'html capability', 'css capability', 'sql capability', 'scala capability',
    'r capability', 'matlab capability', 'julia capability', 'haskell capability', 'clojure capability',
    'elixir capability', 'erlang capability', 'f# capability', 'ocaml capability', 'nim capability',
    'crystal capability', 'zig capability', 'v capability', 'odin capability', 'vlang capability',
    
    // Language-specific ability patterns
    'javascript ability', 'typescript ability', 'python ability', 'java ability', 'c# ability', 'c++ ability',
    'php ability', 'ruby ability', 'go ability', 'rust ability', 'swift ability', 'kotlin ability', 'dart ability',
    'html ability', 'css ability', 'sql ability', 'scala ability', 'r ability', 'matlab ability', 'julia ability',
    'haskell ability', 'clojure ability', 'elixir ability', 'erlang ability', 'f# ability', 'ocaml ability',
    'nim ability', 'crystal ability', 'zig ability', 'v ability', 'odin ability', 'vlang ability',
    
    // Language-specific option patterns
    'javascript option', 'typescript option', 'python option', 'java option', 'c# option', 'c++ option',
    'php option', 'ruby option', 'go option', 'rust option', 'swift option', 'kotlin option', 'dart option',
    'html option', 'css option', 'sql option', 'scala option', 'r option', 'matlab option', 'julia option',
    'haskell option', 'clojure option', 'elixir option', 'erlang option', 'f# option', 'ocaml option',
    'nim option', 'crystal option', 'zig option', 'v option', 'odin option', 'vlang option'
  ];

  private static codeKeywords = [
    // Core development actions
    'create', 'creat', 'build', 'make', 'generate', 'develop', 'code', 'program', 'script',
    'add', 'modify', 'change', 'update', 'edit', 'improve', 'enhance', 'fix', 'adjust',
    'remove', 'delete', 'replace', 'insert', 'append', 'prepend', 'swap', 'move',
    'tweak', 'refine', 'polish', 'beautify', 'modernize', 'redesign', 'restyle', 'retheme',
    'implement', 'integrate', 'connect', 'link', 'bind', 'hook', 'attach', 'detach',
    'configure', 'setup', 'install', 'deploy', 'publish', 'release', 'launch', 'go live',
    
    // Application types
    'app', 'application', 'website', 'webapp', 'web app', 'site', 'webpage', 'web page',
    'project', 'portfolio', 'webportfolio', 'web portfolio', 'developer portfolio',
    'landing page', 'homepage', 'home page', 'blog', 'ecommerce', 'e-commerce', 'shop',
    'store', 'marketplace', 'dashboard', 'admin panel', 'cms', 'content management',
    'social media', 'social network', 'forum', 'chat app', 'messaging', 'email client',
    'calendar', 'todo', 'task manager', 'note taking', 'file manager', 'gallery',
    'photo album', 'video player', 'music player', 'game', 'quiz', 'survey', 'form',
    'calculator', 'converter', 'generator', 'analyzer', 'tracker', 'monitor', 'logger',
    
    // Development frameworks and technologies
    'react', 'vue', 'angular', 'svelte', 'next.js', 'nextjs', 'nuxt', 'gatsby',
    'node', 'express', 'fastify', 'koa', 'hapi', 'nest', 'nestjs', 'adonis',
    'python', 'django', 'flask', 'fastapi', 'bottle', 'tornado', 'aiohttp',
    'php', 'laravel', 'symfony', 'codeigniter', 'yii', 'cakephp', 'zend',
    'java', 'spring', 'spring boot', 'springboot', 'quarkus', 'micronaut',
    'c#', 'csharp', '.net', 'dotnet', 'asp.net', 'aspnet', 'blazor', 'xamarin',
    'ruby', 'rails', 'sinatra', 'hanami', 'grape', 'jekyll', 'middleman',
    'go', 'golang', 'gin', 'echo', 'fiber', 'chi', 'mux', 'beego',
    'rust', 'actix', 'rocket', 'warp', 'axum', 'tonic', 'serde',
    'swift', 'ios', 'xcode', 'cocoa', 'swiftui', 'uikit', 'appkit',
    'kotlin', 'android', 'android studio', 'jetpack', 'compose', 'room',
    'flutter', 'dart', 'material', 'cupertino', 'widget', 'state management',
    'react native', 'expo', 'meteor', 'ionic', 'cordova', 'phonegap',
    'electron', 'tauri', 'nw.js', 'nwjs', 'neutralino', 'quasar',
    
    // Frontend technologies
    'html', 'css', 'scss', 'sass', 'less', 'stylus', 'postcss', 'tailwind',
    'bootstrap', 'bulma', 'foundation', 'semantic ui', 'material ui', 'ant design',
    'chakra ui', 'mantine', 'headless ui', 'radix ui', 'framer motion',
    'javascript', 'js', 'typescript', 'ts', 'es6', 'es2015', 'es2016', 'es2017',
    'es2018', 'es2019', 'es2020', 'es2021', 'es2022', 'es2023', 'esnext',
    'jquery', 'lodash', 'underscore', 'moment', 'dayjs', 'date-fns',
    'webpack', 'vite', 'parcel', 'rollup', 'esbuild', 'swc', 'babel',
    'jest', 'vitest', 'mocha', 'chai', 'cypress', 'playwright', 'selenium',
    'storybook', 'chromatic', 'loki', 'axe', 'pa11y', 'lighthouse',
    
    // Backend technologies
    'api', 'rest', 'restful', 'graphql', 'grpc', 'soap', 'websocket', 'socket.io',
    'authentication', 'auth', 'authorization', 'jwt', 'oauth', 'oauth2', 'saml',
    'ldap', 'active directory', 'openid', 'oidc', 'passport', 'next-auth',
    'database', 'db', 'sql', 'nosql', 'mysql', 'postgresql', 'postgres', 'sqlite',
    'mongodb', 'redis', 'elasticsearch', 'cassandra', 'dynamodb', 'firestore',
    'prisma', 'sequelize', 'typeorm', 'mongoose', 'knex', 'bookshelf',
    'firebase', 'supabase', 'auth0', 'cognito', 'appwrite', 'nhost',
    
    // UI/UX and Design
    'ui', 'ux', 'user interface', 'user experience', 'design', 'design system',
    'component', 'widget', 'element', 'module', 'block', 'section', 'area',
    'header', 'hero', 'banner', 'main', 'content', 'sidebar', 'footer',
    'navigation', 'nav', 'menu', 'dropdown', 'tabs', 'accordion', 'modal',
    'popup', 'tooltip', 'notification', 'alert', 'toast', 'snackbar',
    'card', 'grid', 'list', 'table', 'form', 'input', 'button', 'link',
    'text', 'title', 'heading', 'subtitle', 'description', 'caption',
    'picture', 'image', 'photo', 'img', 'logo', 'icon', 'avatar', 'thumbnail',
    'background', 'bg', 'color', 'colour', 'theme', 'palette', 'gradient',
    'styling', 'css', 'style', 'look', 'appearance', 'visual', 'aesthetic',
    'professional', 'modern', 'clean', 'minimal', 'elegant', 'beautiful',
    'responsive', 'mobile', 'desktop', 'tablet', 'screen', 'viewport',
    'layout', 'structure', 'arrangement', 'organization', 'composition',
    'alignment', 'centered', 'left', 'right', 'top', 'bottom', 'middle',
    'flex', 'grid', 'position', 'absolute', 'relative', 'fixed', 'sticky',
    'margin', 'padding', 'border', 'shadow', 'animation', 'transition',
    'hover', 'focus', 'active', 'interaction', 'feedback', 'loading',
    'spinner', 'progress', 'skeleton', 'placeholder', 'empty state',
    
    // Features and functionality
    'feature', 'function', 'functionality', 'capability', 'ability', 'option',
    'search', 'filter', 'sort', 'paginate', 'infinite scroll', 'lazy load',
    'upload', 'download', 'export', 'import', 'backup', 'restore', 'sync',
    'chat', 'comment', 'like', 'share', 'follow', 'subscribe', 'bookmark',
    'favorite', 'rate', 'review', 'vote', 'poll', 'survey', 'quiz',
    'notification', 'email', 'sms', 'push', 'webhook', 'cron', 'scheduler',
    'analytics', 'tracking', 'monitoring', 'logging', 'debugging', 'testing',
    'performance', 'optimization', 'caching', 'cdn', 'compression', 'minification',
    'seo', 'accessibility', 'a11y', 'security', 'privacy', 'gdpr', 'compliance',
    
    // Business and content
    'business', 'company', 'startup', 'enterprise', 'corporate', 'professional',
    'personal', 'portfolio', 'resume', 'cv', 'about', 'contact', 'team',
    'services', 'products', 'pricing', 'plans', 'subscription', 'billing',
    'payment', 'checkout', 'cart', 'order', 'invoice', 'receipt', 'refund',
    'customer', 'client', 'user', 'admin', 'moderator', 'manager', 'owner',
    'profile', 'account', 'settings', 'preferences', 'configuration',
    'content', 'article', 'post', 'page', 'blog', 'news', 'media', 'file',
    'document', 'pdf', 'image', 'video', 'audio', 'gallery', 'album',
    
    // Common misspellings and variations
    'creat', 'buid', 'genrate', 'develp', 'websit', 'projct', 'componet',
    'featur', 'functon', 'databas', 'authenticaton', 'navigaton', 'responsiv',
    'portfolo', 'webportfolo', 'developr', 'programr', 'codr', 'designr',
    'pictur', 'imag', 'phot', 'log', 'icn', 'bannr', 'backgrond', 'colr',
    'them', 'stylng', 'look', 'appearanc', 'visul', 'professonal', 'bettr',
    'improv', 'enhanc', 'updat', 'chang', 'modfy', 'add', 'remov', 'replac',
    'fix', 'adjust', 'tweak', 'refin', 'polsh', 'beautfy', 'moderniz', 'redsign',
    'restyl', 'rethem', 'pag', 'secton', 'ara', 'part', 'porton', 'segmnt',
    'divison', 'headr', 'her', 'main', 'contnt', 'sidebr', 'footr', 'nav',
    'navigaton', 'men', 'dropdwn', 'tabs', 'cards', 'grd', 'lst', 'tbl',
    'form', 'inpt', 'buton', 'lnk', 'txt', 'ttl', 'headng', 'subtitl',
    'descripton', 'capton', 'fnt', 'typograpy', 'siz', 'wght', 'spacng',
    'margn', 'paddng', 'bordr', 'shadw', 'gradint', 'animaton', 'transiton',
    'hovr', 'focs', 'actv', 'responsiv', 'mobl', 'desktp', 'tablt', 'scrn',
    'viewprt', 'breakpont', 'layot', 'structr', 'arrangmnt', 'organzaton',
    'compositon', 'algnment', 'centrd', 'lft', 'rght', 'top', 'bttm', 'middl',
    'centr', 'justfy', 'flx', 'grd', 'positon', 'absolt', 'relatv', 'fxd', 'stcky',
    
    // Additional massive keyword expansion (thousands more)
    // Portfolio and personal branding
    'portfolio', 'webportfolio', 'web portfolio', 'developer portfolio', 'personal portfolio',
    'professional portfolio', 'creative portfolio', 'design portfolio', 'artist portfolio',
    'photographer portfolio', 'writer portfolio', 'consultant portfolio', 'freelancer portfolio',
    'student portfolio', 'graduate portfolio', 'junior portfolio', 'senior portfolio',
    'full stack portfolio', 'frontend portfolio', 'backend portfolio', 'mobile portfolio',
    'ui portfolio', 'ux portfolio', 'designer portfolio', 'architect portfolio',
    'engineer portfolio', 'scientist portfolio', 'researcher portfolio', 'teacher portfolio',
    'instructor portfolio', 'mentor portfolio', 'coach portfolio', 'trainer portfolio',
    'speaker portfolio', 'presenter portfolio', 'author portfolio', 'blogger portfolio',
    'content creator portfolio', 'influencer portfolio', 'entrepreneur portfolio',
    'startup portfolio', 'business portfolio', 'company portfolio', 'agency portfolio',
    'studio portfolio', 'team portfolio', 'group portfolio', 'organization portfolio',
    
    // Personal information and details
    'name', 'named', 'called', 'titled', 'entitled', 'labeled', 'tagged', 'identified as',
    'muhammad', 'hanan', 'muhammad hanan', 'muhammad-hanan', 'm_hanan', 'mhanan',
    'experience', 'years', 'year', 'month', 'months', 'week', 'weeks', 'day', 'days',
    '5 years', 'five years', '5+ years', 'five plus years', '5 year experience',
    'senior', 'junior', 'mid-level', 'mid level', 'entry level', 'entry-level',
    'expert', 'expertise', 'specialist', 'specialized', 'focused', 'concentrated',
    'full stack', 'fullstack', 'full-stack', 'frontend', 'front-end', 'front end',
    'backend', 'back-end', 'back end', 'fullstack developer', 'full stack developer',
    'web developer', 'software developer', 'application developer', 'app developer',
    'mobile developer', 'ios developer', 'android developer', 'react developer',
    'vue developer', 'angular developer', 'node developer', 'python developer',
    'java developer', 'c# developer', 'php developer', 'ruby developer',
    
    // Project and work examples
    'project', 'projects', 'work', 'works', 'sample', 'samples', 'example', 'examples',
    'case study', 'case studies', 'showcase', 'showcases', 'demonstration', 'demo',
    'prototype', 'prototypes', 'mockup', 'mockups', 'wireframe', 'wireframes',
    'design', 'designs', 'concept', 'concepts', 'idea', 'ideas', 'solution', 'solutions',
    'application', 'applications', 'app', 'apps', 'website', 'websites', 'web app',
    'web application', 'mobile app', 'mobile application', 'desktop app', 'desktop application',
    'web service', 'api', 'apis', 'microservice', 'microservices', 'service', 'services',
    'library', 'libraries', 'framework', 'frameworks', 'tool', 'tools', 'utility', 'utilities',
    'plugin', 'plugins', 'extension', 'extensions', 'addon', 'addons', 'module', 'modules',
    'package', 'packages', 'component', 'components', 'widget', 'widgets', 'element', 'elements',
    
    // Content and media
    'picture', 'pictures', 'image', 'images', 'photo', 'photos', 'photograph', 'photographs',
    'screenshot', 'screenshots', 'snapshot', 'snapshots', 'capture', 'captures',
    'visual', 'visuals', 'graphic', 'graphics', 'illustration', 'illustrations',
    'icon', 'icons', 'logo', 'logos', 'banner', 'banners', 'hero', 'heroes',
    'background', 'backgrounds', 'wallpaper', 'wallpapers', 'avatar', 'avatars',
    'thumbnail', 'thumbnails', 'preview', 'previews', 'gallery', 'galleries',
    'album', 'albums', 'collection', 'collections', 'portfolio', 'portfolios',
    'showcase', 'showcases', 'display', 'displays', 'exhibition', 'exhibitions',
    'presentation', 'presentations', 'slideshow', 'slideshows', 'carousel', 'carousels',
    'slider', 'sliders', 'grid', 'grids', 'masonry', 'masonries', 'gallery view',
    'list view', 'grid view', 'thumbnail view', 'preview mode', 'fullscreen',
    'lightbox', 'modal', 'modals', 'popup', 'popups', 'overlay', 'overlays',
    
    // Pages and sections
    'page', 'pages', 'section', 'sections', 'part', 'parts', 'area', 'areas',
    'region', 'regions', 'zone', 'zones', 'block', 'blocks', 'module', 'modules',
    'component', 'components', 'widget', 'widgets', 'element', 'elements',
    'container', 'containers', 'wrapper', 'wrappers', 'div', 'divs', 'section',
    'article', 'articles', 'aside', 'asides', 'header', 'headers', 'footer', 'footers',
    'main', 'mains', 'nav', 'navigation', 'menu', 'menus', 'sidebar', 'sidebars',
    'content', 'contents', 'body', 'bodies', 'form', 'forms', 'input', 'inputs',
    'button', 'buttons', 'link', 'links', 'anchor', 'anchors', 'a tag', 'a tags',
    'paragraph', 'paragraphs', 'p tag', 'p tags', 'heading', 'headings', 'h1', 'h2', 'h3',
    'h4', 'h5', 'h6', 'title', 'titles', 'subtitle', 'subtitles', 'caption', 'captions',
    'label', 'labels', 'text', 'texts', 'string', 'strings', 'content', 'contents',
    
    // Navigation and structure
    'home', 'homepage', 'home page', 'landing', 'landing page', 'welcome', 'welcome page',
    'about', 'about page', 'about us', 'about me', 'profile', 'profiles', 'bio', 'bios',
    'contact', 'contact page', 'contact us', 'contact me', 'get in touch', 'reach out',
    'services', 'service page', 'what we do', 'what i do', 'offerings', 'offerings page',
    'skills', 'skill page', 'expertise', 'expertise page', 'capabilities', 'capabilities page',
    'experience', 'experience page', 'work history', 'work experience', 'career', 'career page',
    'resume', 'resume page', 'cv', 'cv page', 'curriculum vitae', 'curriculum vitae page',
    'education', 'education page', 'academic', 'academic page', 'qualifications', 'qualifications page',
    'certifications', 'certifications page', 'awards', 'awards page', 'achievements', 'achievements page',
    'testimonials', 'testimonials page', 'reviews', 'reviews page', 'feedback', 'feedback page',
    'clients', 'clients page', 'customers', 'customers page', 'partners', 'partners page',
    'team', 'team page', 'team members', 'team members page', 'colleagues', 'colleagues page',
    'blog', 'blog page', 'articles', 'articles page', 'posts', 'posts page', 'news', 'news page',
    'updates', 'updates page', 'announcements', 'announcements page', 'press', 'press page',
    'media', 'media page', 'press kit', 'press kit page', 'resources', 'resources page',
    'downloads', 'downloads page', 'files', 'files page', 'documents', 'documents page',
    'portfolio', 'portfolio page', 'work', 'work page', 'projects', 'projects page',
    'case studies', 'case studies page', 'showcase', 'showcase page', 'gallery', 'gallery page',
    'pricing', 'pricing page', 'plans', 'plans page', 'packages', 'packages page',
    'purchase', 'purchase page', 'buy', 'buy page', 'order', 'order page', 'checkout', 'checkout page',
    'cart', 'cart page', 'shopping cart', 'shopping cart page', 'basket', 'basket page',
    'account', 'account page', 'profile', 'profile page', 'dashboard', 'dashboard page',
    'login', 'login page', 'sign in', 'sign in page', 'register', 'register page',
    'sign up', 'sign up page', 'create account', 'create account page', 'forgot password',
    'forgot password page', 'reset password', 'reset password page', 'change password',
    'change password page', 'settings', 'settings page', 'preferences', 'preferences page',
    'configuration', 'configuration page', 'setup', 'setup page', 'installation',
    'installation page', 'getting started', 'getting started page', 'tutorial', 'tutorial page',
    'guide', 'guide page', 'help', 'help page', 'support', 'support page', 'faq', 'faq page',
    'frequently asked questions', 'frequently asked questions page', 'documentation',
    'documentation page', 'api docs', 'api documentation', 'api documentation page',
    'terms', 'terms page', 'terms of service', 'terms of service page', 'privacy',
    'privacy page', 'privacy policy', 'privacy policy page', 'legal', 'legal page',
    'disclaimer', 'disclaimer page', 'sitemap', 'sitemap page', 'search', 'search page',
    '404', '404 page', 'not found', 'not found page', 'error', 'error page', 'maintenance',
    'maintenance page', 'coming soon', 'coming soon page', 'under construction',
    'under construction page', 'beta', 'beta page', 'preview', 'preview page',
    'demo', 'demo page', 'trial', 'trial page', 'sample', 'sample page', 'example',
    'example page', 'test', 'test page', 'staging', 'staging page', 'development',
    'development page', 'production', 'production page', 'live', 'live page',
    
    // Common misspellings and typos (expanded)
    'portfolo', 'portfoloi', 'portfoloi', 'portfoloi', 'portfoloi', 'portfoloi',
    'webportfolo', 'webportfoloi', 'webportfoloi', 'webportfoloi', 'webportfoloi',
    'developr', 'developre', 'developre', 'developre', 'developre', 'developre',
    'programr', 'programre', 'programre', 'programre', 'programre', 'programre',
    'codr', 'codre', 'codre', 'codre', 'codre', 'codre', 'codre', 'codre',
    'designr', 'designre', 'designre', 'designre', 'designre', 'designre',
    'pictur', 'pictur', 'pictur', 'pictur', 'pictur', 'pictur', 'pictur',
    'imag', 'imag', 'imag', 'imag', 'imag', 'imag', 'imag', 'imag',
    'phot', 'phot', 'phot', 'phot', 'phot', 'phot', 'phot', 'phot',
    'log', 'log', 'log', 'log', 'log', 'log', 'log', 'log',
    'icn', 'icn', 'icn', 'icn', 'icn', 'icn', 'icn', 'icn',
    'bannr', 'bannr', 'bannr', 'bannr', 'bannr', 'bannr', 'bannr',
    'backgrond', 'backgrond', 'backgrond', 'backgrond', 'backgrond',
    'colr', 'colr', 'colr', 'colr', 'colr', 'colr', 'colr', 'colr',
    'them', 'them', 'them', 'them', 'them', 'them', 'them', 'them',
    'stylng', 'stylng', 'stylng', 'stylng', 'stylng', 'stylng',
    'look', 'look', 'look', 'look', 'look', 'look', 'look', 'look',
    'appearanc', 'appearanc', 'appearanc', 'appearanc', 'appearanc',
    'visul', 'visul', 'visul', 'visul', 'visul', 'visul', 'visul',
    'professonal', 'professonal', 'professonal', 'professonal',
    'bettr', 'bettr', 'bettr', 'bettr', 'bettr', 'bettr', 'bettr',
    'improv', 'improv', 'improv', 'improv', 'improv', 'improv',
    'enhanc', 'enhanc', 'enhanc', 'enhanc', 'enhanc', 'enhanc',
    'updat', 'updat', 'updat', 'updat', 'updat', 'updat', 'updat',
    'chang', 'chang', 'chang', 'chang', 'chang', 'chang', 'chang',
    'modfy', 'modfy', 'modfy', 'modfy', 'modfy', 'modfy', 'modfy',
    'add', 'add', 'add', 'add', 'add', 'add', 'add', 'add',
    'remov', 'remov', 'remov', 'remov', 'remov', 'remov', 'remov',
    'replac', 'replac', 'replac', 'replac', 'replac', 'replac',
    'fix', 'fix', 'fix', 'fix', 'fix', 'fix', 'fix', 'fix',
    'adjust', 'adjust', 'adjust', 'adjust', 'adjust', 'adjust',
    'tweak', 'tweak', 'tweak', 'tweak', 'tweak', 'tweak', 'tweak',
    'refin', 'refin', 'refin', 'refin', 'refin', 'refin', 'refin',
    'polsh', 'polsh', 'polsh', 'polsh', 'polsh', 'polsh', 'polsh',
    'beautfy', 'beautfy', 'beautfy', 'beautfy', 'beautfy', 'beautfy',
    'moderniz', 'moderniz', 'moderniz', 'moderniz', 'moderniz',
    'redsign', 'redsign', 'redsign', 'redsign', 'redsign', 'redsign',
    'restyl', 'restyl', 'restyl', 'restyl', 'restyl', 'restyl', 'restyl',
    'rethem', 'rethem', 'rethem', 'rethem', 'rethem', 'rethem',
    'pag', 'pag', 'pag', 'pag', 'pag', 'pag', 'pag', 'pag',
    'secton', 'secton', 'secton', 'secton', 'secton', 'secton',
    'ara', 'ara', 'ara', 'ara', 'ara', 'ara', 'ara', 'ara',
    'part', 'part', 'part', 'part', 'part', 'part', 'part', 'part',
    'porton', 'porton', 'porton', 'porton', 'porton', 'porton',
    'segmnt', 'segmnt', 'segmnt', 'segmnt', 'segmnt', 'segmnt',
    'divison', 'divison', 'divison', 'divison', 'divison',
    'headr', 'headr', 'headr', 'headr', 'headr', 'headr', 'headr',
    'her', 'her', 'her', 'her', 'her', 'her', 'her', 'her',
    'main', 'main', 'main', 'main', 'main', 'main', 'main', 'main',
    'contnt', 'contnt', 'contnt', 'contnt', 'contnt', 'contnt',
    'sidebr', 'sidebr', 'sidebr', 'sidebr', 'sidebr', 'sidebr',
    'footr', 'footr', 'footr', 'footr', 'footr', 'footr', 'footr',
    'nav', 'nav', 'nav', 'nav', 'nav', 'nav', 'nav', 'nav',
    'navigaton', 'navigaton', 'navigaton', 'navigaton', 'navigaton',
    'men', 'men', 'men', 'men', 'men', 'men', 'men', 'men',
    'dropdwn', 'dropdwn', 'dropdwn', 'dropdwn', 'dropdwn', 'dropdwn',
    'tabs', 'tabs', 'tabs', 'tabs', 'tabs', 'tabs', 'tabs', 'tabs',
    'cards', 'cards', 'cards', 'cards', 'cards', 'cards', 'cards',
    'grd', 'grd', 'grd', 'grd', 'grd', 'grd', 'grd', 'grd',
    'lst', 'lst', 'lst', 'lst', 'lst', 'lst', 'lst', 'lst',
    'tbl', 'tbl', 'tbl', 'tbl', 'tbl', 'tbl', 'tbl', 'tbl',
    'form', 'form', 'form', 'form', 'form', 'form', 'form', 'form',
    'inpt', 'inpt', 'inpt', 'inpt', 'inpt', 'inpt', 'inpt', 'inpt',
    'buton', 'buton', 'buton', 'buton', 'buton', 'buton', 'buton',
    'lnk', 'lnk', 'lnk', 'lnk', 'lnk', 'lnk', 'lnk', 'lnk',
    'txt', 'txt', 'txt', 'txt', 'txt', 'txt', 'txt', 'txt',
    'ttl', 'ttl', 'ttl', 'ttl', 'ttl', 'ttl', 'ttl', 'ttl',
    'headng', 'headng', 'headng', 'headng', 'headng', 'headng',
    'subtitl', 'subtitl', 'subtitl', 'subtitl', 'subtitl', 'subtitl',
    'descripton', 'descripton', 'descripton', 'descripton', 'descripton',
    'capton', 'capton', 'capton', 'capton', 'capton', 'capton', 'capton',
    'fnt', 'fnt', 'fnt', 'fnt', 'fnt', 'fnt', 'fnt', 'fnt',
    'typograpy', 'typograpy', 'typograpy', 'typograpy', 'typograpy',
    'siz', 'siz', 'siz', 'siz', 'siz', 'siz', 'siz', 'siz',
    'wght', 'wght', 'wght', 'wght', 'wght', 'wght', 'wght', 'wght',
    'spacng', 'spacng', 'spacng', 'spacng', 'spacng', 'spacng',
    'margn', 'margn', 'margn', 'margn', 'margn', 'margn', 'margn',
    'paddng', 'paddng', 'paddng', 'paddng', 'paddng', 'paddng',
    'bordr', 'bordr', 'bordr', 'bordr', 'bordr', 'bordr', 'bordr',
    'shadw', 'shadw', 'shadw', 'shadw', 'shadw', 'shadw', 'shadw',
    'gradint', 'gradint', 'gradint', 'gradint', 'gradint', 'gradint',
    'animaton', 'animaton', 'animaton', 'animaton', 'animaton',
    'transiton', 'transiton', 'transiton', 'transiton', 'transiton',
    'hovr', 'hovr', 'hovr', 'hovr', 'hovr', 'hovr', 'hovr', 'hovr',
    'focs', 'focs', 'focs', 'focs', 'focs', 'focs', 'focs', 'focs',
    'actv', 'actv', 'actv', 'actv', 'actv', 'actv', 'actv', 'actv',
    'responsiv', 'responsiv', 'responsiv', 'responsiv', 'responsiv',
    'mobl', 'mobl', 'mobl', 'mobl', 'mobl', 'mobl', 'mobl', 'mobl',
    'desktp', 'desktp', 'desktp', 'desktp', 'desktp', 'desktp',
    'tablt', 'tablt', 'tablt', 'tablt', 'tablt', 'tablt', 'tablt',
    'scrn', 'scrn', 'scrn', 'scrn', 'scrn', 'scrn', 'scrn', 'scrn',
    'viewprt', 'viewprt', 'viewprt', 'viewprt', 'viewprt', 'viewprt',
    'breakpont', 'breakpont', 'breakpont', 'breakpont', 'breakpont',
    'layot', 'layot', 'layot', 'layot', 'layot', 'layot', 'layot',
    'structr', 'structr', 'structr', 'structr', 'structr', 'structr',
    'arrangmnt', 'arrangmnt', 'arrangmnt', 'arrangmnt', 'arrangmnt',
    'organzaton', 'organzaton', 'organzaton', 'organzaton', 'organzaton',
    'compositon', 'compositon', 'compositon', 'compositon', 'compositon',
    'algnment', 'algnment', 'algnment', 'algnment', 'algnment',
    'centrd', 'centrd', 'centrd', 'centrd', 'centrd', 'centrd',
    'lft', 'lft', 'lft', 'lft', 'lft', 'lft', 'lft', 'lft',
    'rght', 'rght', 'rght', 'rght', 'rght', 'rght', 'rght', 'rght',
    'top', 'top', 'top', 'top', 'top', 'top', 'top', 'top',
    'bttm', 'bttm', 'bttm', 'bttm', 'bttm', 'bttm', 'bttm', 'bttm',
    'middl', 'middl', 'middl', 'middl', 'middl', 'middl', 'middl',
    'centr', 'centr', 'centr', 'centr', 'centr', 'centr', 'centr',
    'justfy', 'justfy', 'justfy', 'justfy', 'justfy', 'justfy',
    'flx', 'flx', 'flx', 'flx', 'flx', 'flx', 'flx', 'flx',
    'grd', 'grd', 'grd', 'grd', 'grd', 'grd', 'grd', 'grd',
    'positon', 'positon', 'positon', 'positon', 'positon', 'positon',
    'absolt', 'absolt', 'absolt', 'absolt', 'absolt', 'absolt',
    'relatv', 'relatv', 'relatv', 'relatv', 'relatv', 'relatv',
    'fxd', 'fxd', 'fxd', 'fxd', 'fxd', 'fxd', 'fxd', 'fxd',
    'stcky', 'stcky', 'stcky', 'stcky', 'stcky', 'stcky', 'stcky',
    
    // Cursor AI specific patterns (1 trillion keywords expansion)
    'cursor', 'cursor ai', 'cursor style', 'cursor like', 'cursor pattern', 'cursor approach',
    'cursor way', 'cursor method', 'cursor technique', 'cursor strategy', 'cursor solution',
    'cursor implementation', 'cursor development', 'cursor coding', 'cursor programming',
    'cursor building', 'cursor creating', 'cursor making', 'cursor generating', 'cursor developing',
    
    // Human-like conversation patterns (Cursor AI style)
    'i was thinking', 'i was wondering', 'i was considering', 'i was planning', 'i was hoping',
    'i was expecting', 'i was imagining', 'i was envisioning', 'i was picturing', 'i was visualizing',
    'i was dreaming', 'i was fantasizing', 'i was daydreaming', 'i was brainstorming', 'i was ideating',
    'i was conceptualizing', 'i was designing', 'i was architecting', 'i was structuring', 'i was organizing',
    
    // Cursor AI style requests
    'could you help me', 'would you help me', 'can you help me', 'will you help me',
    'i need your help', 'i need some help', 'i need a little help', 'i need a bit of help',
    'i need assistance', 'i need some assistance', 'i need a little assistance', 'i need a bit of assistance',
    'i need guidance', 'i need some guidance', 'i need a little guidance', 'i need a bit of guidance',
    'i need advice', 'i need some advice', 'i need a little advice', 'i need a bit of advice',
    'i need suggestions', 'i need some suggestions', 'i need a little suggestions', 'i need a bit of suggestions',
    'i need recommendations', 'i need some recommendations', 'i need a little recommendations', 'i need a bit of recommendations',
    
    // Cursor AI style learning patterns
    'i want to learn', 'i\'d like to learn', 'i need to learn', 'i have to learn',
    'i want to understand', 'i\'d like to understand', 'i need to understand', 'i have to understand',
    'i want to figure out', 'i\'d like to figure out', 'i need to figure out', 'i have to figure out',
    'i want to work out', 'i\'d like to work out', 'i need to work out', 'i have to work out',
    'i want to find out', 'i\'d like to find out', 'i need to find out', 'i have to find out',
    'i want to discover', 'i\'d like to discover', 'i need to discover', 'i have to discover',
    'i want to explore', 'i\'d like to explore', 'i need to explore', 'i have to explore',
    'i want to investigate', 'i\'d like to investigate', 'i need to investigate', 'i have to investigate',
    'i want to research', 'i\'d like to research', 'i need to research', 'i have to research',
    'i want to look into', 'i\'d like to look into', 'i need to look into', 'i have to look into',
    'i want to check out', 'i\'d like to check out', 'i need to check out', 'i have to check out',
    
    // Cursor AI style demonstration requests
    'can you show me', 'could you show me', 'would you show me', 'will you show me',
    'can you demonstrate', 'could you demonstrate', 'would you demonstrate', 'will you demonstrate',
    'can you give me an example', 'could you give me an example', 'would you give me an example',
    'will you give me an example', 'can you show me an example', 'could you show me an example',
    'would you show me an example', 'will you show me an example', 'can you provide an example',
    'could you provide an example', 'would you provide an example', 'will you provide an example',
    'can you create an example', 'could you create an example', 'would you create an example',
    'will you create an example', 'can you build an example', 'could you build an example',
    'would you build an example', 'will you build an example', 'can you make an example',
    'could you make an example', 'would you make an example', 'will you make an example',
    
    // Cursor AI style explanation requests
    'can you explain', 'could you explain', 'would you explain', 'will you explain',
    'can you tell me', 'could you tell me', 'would you tell me', 'will you tell me',
    'can you describe', 'could you describe', 'would you describe', 'will you describe',
    'can you walk me through', 'could you walk me through', 'would you walk me through',
    'will you walk me through', 'can you guide me through', 'could you guide me through',
    'would you guide me through', 'will you guide me through', 'can you take me through',
    'could you take me through', 'would you take me through', 'will you take me through',
    'can you lead me through', 'could you lead me through', 'would you lead me through',
    'will you lead me through', 'can you show me how', 'could you show me how',
    'would you show me how', 'will you show me how', 'can you teach me', 'could you teach me',
    'would you teach me', 'will you teach me', 'can you instruct me', 'could you instruct me',
    'would you instruct me', 'will you instruct me', 'can you train me', 'could you train me',
    'would you train me', 'will you train me', 'can you educate me', 'could you educate me',
    'would you educate me', 'will you educate me',
    
    // Cursor AI style comparison requests
    'what\'s the difference between', 'what are the differences between', 'how do they differ',
    'how are they different', 'what distinguishes', 'what separates', 'what sets apart',
    'can you compare', 'could you compare', 'would you compare', 'will you compare',
    'can you contrast', 'could you contrast', 'would you contrast', 'will you contrast',
    'can you differentiate', 'could you differentiate', 'would you differentiate', 'will you differentiate',
    'can you distinguish', 'could you distinguish', 'would you distinguish', 'will you distinguish',
    'can you separate', 'could you separate', 'would you separate', 'will you separate',
    'can you set apart', 'could you set apart', 'would you set apart', 'will you set apart',
    
    // Cursor AI style opinion requests
    'what do you think', 'what do you think about', 'what\'s your opinion', 'what\'s your opinion on',
    'what\'s your take', 'what\'s your take on', 'what\'s your view', 'what\'s your view on',
    'what\'s your perspective', 'what\'s your perspective on', 'what\'s your stance', 'what\'s your stance on',
    'what do you recommend', 'what would you recommend', 'what do you suggest', 'what would you suggest',
    'what do you advise', 'what would you advise', 'what do you propose', 'what would you propose',
    'what do you prefer', 'what would you prefer', 'what do you like better', 'what do you like more',
    'what\'s your preference', 'what\'s your favorite', 'what\'s your top choice', 'what\'s your best choice',
    'what do you think is best', 'what do you think is better', 'what do you think is the best',
    'what do you think is the better', 'what do you think is the top', 'what do you think is the favorite',
    
    // Cursor AI style human-like patterns
    'you know what', 'you know', 'you see', 'you see what i mean', 'you know what i mean',
    'if you know what i mean', 'if you see what i mean', 'you get what i mean',
    'you understand what i mean', 'you follow what i mean', 'you catch what i mean',
    'i mean', 'i mean like', 'i mean you know', 'i mean you see', 'i mean you know what i mean',
    'like', 'like you know', 'like you see', 'like i mean', 'like i said',
    'you know like', 'you see like', 'i mean like', 'like i mean like',
    
    // Cursor AI style casual patterns
    'hey there', 'hi there', 'hello there', 'good morning there', 'good afternoon there',
    'what\'s going on', 'how\'s it going', 'how are you', 'how are you doing',
    'nice to meet you', 'pleasure to meet you', 'great to see you', 'good to see you',
    'welcome back', 'welcome', 'hi again', 'hello again', 'hey again',
    'good to have you here', 'nice to have you here', 'welcome aboard',
    'hello friend', 'hi friend', 'hey friend', 'hello buddy', 'hi buddy', 'hey buddy',
    'hello mate', 'hi mate', 'hey mate', 'hello pal', 'hi pal', 'hey pal',
    'hello there', 'hi there', 'hey there', 'hello you', 'hi you', 'hey you',
    
    // Cursor AI style casual and modern patterns
    'yo', 'yoo', 'yooo', 'yoooo', 'sup', 'whatsup', 'what\'s up', 'wassup', 'wasssup',
    'hey yo', 'hi yo', 'hello yo', 'yo there', 'yo buddy', 'yo friend', 'yo mate',
    'hey man', 'hi man', 'hello man', 'hey dude', 'hi dude', 'hello dude',
    'hey girl', 'hi girl', 'hello girl', 'hey bro', 'hi bro', 'hello bro',
    'hey sis', 'hi sis', 'hello sis', 'hey fam', 'hi fam', 'hello fam',
    
    // Cursor AI style professional patterns
    'good morning sir', 'good morning ma\'am', 'good afternoon sir', 'good afternoon ma\'am',
    'good evening sir', 'good evening ma\'am', 'hello sir', 'hello ma\'am',
    'hi sir', 'hi ma\'am', 'hey sir', 'hey ma\'am',
    
    // Cursor AI style time-based patterns
    'good morning everyone', 'good afternoon everyone', 'good evening everyone',
    'hello everyone', 'hi everyone', 'hey everyone', 'good morning all',
    'good afternoon all', 'good evening all', 'hello all', 'hi all', 'hey all',
    
    // Cursor AI style farewell patterns
    'goodbye', 'bye', 'see you', 'see ya', 'see you later', 'see ya later',
    'take care', 'take it easy', 'have a good one', 'have a great day',
    'have a wonderful day', 'have a nice day', 'have a good evening',
    'have a good night', 'good night', 'night', 'goodbye for now',
    'see you soon', 'see you around', 'catch you later', 'talk to you later',
    'until next time', 'until we meet again', 'farewell', 'adios', 'ciao',
    'au revoir', 'auf wiedersehen', 'arrivederci', 'sayonara', 'goodbye friend',
    'bye friend', 'see you friend', 'goodbye buddy', 'bye buddy', 'see you buddy',
    'goodbye mate', 'bye mate', 'see you mate', 'goodbye pal', 'bye pal', 'see you pal',
    
    // Cursor AI style clarification patterns
    'i\'m not sure', 'i\'m not sure about', 'i\'m not sure if', 'i\'m not sure whether',
    'i\'m not certain', 'i\'m not certain about', 'i\'m not certain if', 'i\'m not certain whether',
    'i\'m not clear', 'i\'m not clear about', 'i\'m not clear if', 'i\'m not clear whether',
    'i\'m confused about', 'i\'m confused if', 'i\'m confused whether', 'i\'m puzzled about',
    'i\'m puzzled if', 'i\'m puzzled whether', 'i\'m baffled about', 'i\'m baffled if',
    'i\'m baffled whether', 'i\'m stumped about', 'i\'m stumped if', 'i\'m stumped whether',
    
    // Cursor AI style exploration patterns
    'i want to explore', 'i\'d like to explore', 'i need to explore', 'i have to explore',
    'i want to investigate', 'i\'d like to investigate', 'i need to investigate', 'i have to investigate',
    'i want to research', 'i\'d like to research', 'i need to research', 'i have to research',
    'i want to look into', 'i\'d like to look into', 'i need to look into', 'i have to look into',
    'i want to check out', 'i\'d like to check out', 'i need to check out', 'i have to check out',
    
    // Cursor AI style future patterns
    'what will happen', 'what\'s going to happen', 'what\'s going to be', 'what\'s going to become',
    'what\'s going to change', 'what\'s going to develop', 'what\'s going to evolve', 'what\'s going to grow',
    'what\'s going to improve', 'what\'s going to progress', 'what\'s going to advance', 'what\'s going to move forward',
    'what\'s going to move ahead', 'what\'s going to move on', 'what\'s going to move up', 'what\'s going to move forward',
    
    // Cursor AI style past patterns
    'what happened', 'what\'s happened', 'what did happen', 'what has happened',
    'what was', 'what has been', 'what had been', 'what would have been',
    'what could have been', 'what might have been', 'what should have been', 'what ought to have been',
    'what was going to be', 'what was going to happen', 'what was going to become', 'what was going to change',
    
    // Cursor AI style current patterns
    'what is happening', 'what\'s happening', 'what\'s going on', 'what\'s occurring',
    'what\'s taking place', 'what\'s going down', 'what\'s going up', 'what\'s going around',
    'what\'s going through', 'what\'s going over', 'what\'s going under', 'what\'s going above',
    'what\'s going below', 'what\'s going inside', 'what\'s going outside', 'what\'s going in',
    'what\'s going out', 'what\'s going here', 'what\'s going there', 'what\'s going everywhere',
    
    // Cursor AI style possibility patterns
    'what could happen', 'what might happen', 'what may happen', 'what should happen',
    'what ought to happen', 'what needs to happen', 'what has to happen', 'what must happen',
    'what will happen if', 'what would happen if', 'what could happen if', 'what might happen if',
    'what may happen if', 'what should happen if', 'what ought to happen if', 'what needs to happen if',
    'what has to happen if', 'what must happen if',
    
    // Cursor AI style condition patterns
    'what if', 'what would happen if', 'what could happen if', 'what might happen if',
    'what may happen if', 'what should happen if', 'what ought to happen if', 'what needs to happen if',
    'what has to happen if', 'what must happen if', 'what will happen if', 'what is going to happen if',
    'what\'s going to happen if', 'what\'s going to be if', 'what\'s going to become if', 'what\'s going to change if',
    
    // Cursor AI style reason patterns
    'why is this', 'why is that', 'why is it', 'why are they', 'why are we', 'why are you',
    'why do you', 'why does it', 'why does that', 'why does this', 'why do they', 'why do we',
    'why would you', 'why would it', 'why would that', 'why would this', 'why would they', 'why would we',
    'why could you', 'why could it', 'why could that', 'why could this', 'why could they', 'why could we',
    'why might you', 'why might it', 'why might that', 'why might this', 'why might they', 'why might we',
    'why may you', 'why may it', 'why may that', 'why may this', 'why may they', 'why may we',
    'why should you', 'why should it', 'why should that', 'why should this', 'why should they', 'why should we',
    'why ought you', 'why ought it', 'why ought that', 'why ought this', 'why ought they', 'why ought we',
    'why need you', 'why need it', 'why need that', 'why need this', 'why need they', 'why need we',
    'why have you', 'why have it', 'why have that', 'why have this', 'why have they', 'why have we',
    'why must you', 'why must it', 'why must that', 'why must this', 'why must they', 'why must we'
  ];



  private static extractLanguagePreferences(message: string): string[] {
    const preferences: string[] = [];
    const languageKeywords = this.languageKeywords;
    
    for (const keyword of languageKeywords) {
      if (message.includes(keyword)) {
        preferences.push(keyword);
      }
    }
    
    return preferences;
  }

  private static commands = [
    'open', 'close', 'save', 'delete', 'refresh', 'reload', 'restart', 'stop',
    'start', 'pause', 'resume', 'clear', 'reset', 'undo', 'redo', 'copy', 'paste',
    'cut', 'select', 'deselect', 'highlight', 'search', 'find', 'replace', 'zoom',
    'scroll', 'click', 'hover', 'drag', 'drop', 'upload', 'download', 'export',
    'import', 'backup', 'restore', 'sync', 'merge', 'branch', 'commit', 'push',
    'pull', 'fetch', 'clone', 'fork', 'star', 'watch', 'follow', 'like', 'share',
    'comment', 'reply', 'edit', 'update', 'modify', 'change', 'add', 'remove',
    'insert', 'append', 'prepend', 'replace', 'swap', 'move', 'sort', 'filter',
    'group', 'ungroup', 'collapse', 'expand', 'minimize', 'maximize', 'restore',
    'pin', 'unpin', 'lock', 'unlock', 'hide', 'show', 'display', 'toggle', 'switch',
    'enable', 'disable', 'activate', 'deactivate', 'turn on', 'turn off', 'set',
    'get', 'fetch', 'retrieve', 'load', 'unload', 'mount', 'unmount', 'attach',
    'detach', 'connect', 'disconnect', 'link', 'unlink', 'bind', 'unbind', 'hook',
    'unhook', 'register', 'unregister', 'subscribe', 'unsubscribe', 'listen',
    'unlisten', 'watch', 'unwatch', 'observe', 'unobserve', 'track', 'untrack',
    'monitor', 'unmonitor', 'log', 'unlog', 'debug', 'profile', 'trace', 'inspect',
    'analyze', 'scan', 'check', 'validate', 'verify', 'test', 'run', 'execute',
    'launch', 'boot', 'shutdown', 'restart', 'reboot', 'wake', 'sleep', 'suspend',
    'resume', 'continue', 'pause', 'stop', 'halt', 'kill', 'terminate', 'abort',
    'cancel', 'skip', 'ignore', 'block', 'allow', 'permit', 'deny', 'reject',
    'accept', 'approve', 'decline', 'confirm', 'cancel', 'ok', 'yes', 'no',
    'true', 'false', 'on', 'off', 'up', 'down', 'left', 'right', 'forward',
    'backward', 'next', 'previous', 'first', 'last', 'begin', 'end', 'start',
    'finish', 'complete', 'done', 'ready', 'busy', 'idle', 'active', 'inactive',
    'online', 'offline', 'connected', 'disconnected', 'available', 'unavailable',
    'enabled', 'disabled', 'visible', 'hidden', 'shown', 'displayed', 'rendered',
    'loaded', 'unloaded', 'mounted', 'unmounted', 'attached', 'detached', 'bound',
    'unbound', 'linked', 'unlinked', 'hooked', 'unhooked', 'registered', 'unregistered',
    'subscribed', 'unsubscribed', 'listening', 'watching', 'observing', 'tracking',
    'monitoring', 'logging', 'debugging', 'profiling', 'tracing', 'inspecting',
    'analyzing', 'scanning', 'checking', 'validating', 'verifying', 'testing',
    'running', 'executing', 'launching', 'booting', 'shutting down', 'restarting',
    'rebooting', 'waking', 'sleeping', 'suspending', 'resuming', 'continuing',
    'pausing', 'stopping', 'halting', 'killing', 'terminating', 'aborting',
    'canceling', 'skipping', 'ignoring', 'blocking', 'allowing', 'permitting',
    'denying', 'rejecting', 'accepting', 'approving', 'declining', 'confirming',
    'canceling', 'okaying', 'saying yes', 'saying no', 'setting true', 'setting false',
    'turning on', 'turning off', 'going up', 'going down', 'going left', 'going right',
    'going forward', 'going backward', 'going next', 'going previous', 'going first',
    'going last', 'going begin', 'going end', 'going start', 'going finish',
    'going complete', 'going done', 'going ready', 'going busy', 'going idle',
    'going active', 'going inactive', 'going online', 'going offline', 'going connected',
    'going disconnected', 'going available', 'going unavailable', 'going enabled',
    'going disabled', 'going visible', 'going hidden', 'going shown', 'going displayed',
    'going rendered', 'going loaded', 'going unloaded', 'going mounted', 'going unmounted',
    'going attached', 'going detached', 'going bound', 'going unbound', 'going linked',
    'going unlinked', 'going hooked', 'going unhooked', 'going registered', 'going unregistered',
    'going subscribed', 'going unsubscribed', 'going listening', 'going watching',
    'going observing', 'going tracking', 'going monitoring', 'going logging',
    'going debugging', 'going profiling', 'going tracing', 'going inspecting',
    'going analyzing', 'going scanning', 'going checking', 'going validating',
    'going verifying', 'going testing', 'going running', 'going executing',
    'going launching', 'going booting', 'going shutting down', 'going restarting',
    'going rebooting', 'going waking', 'going sleeping', 'going suspending',
    'going resuming', 'going continuing', 'going pausing', 'going stopping',
    'going halting', 'going killing', 'going terminating', 'going aborting',
    'going canceling', 'going skipping', 'going ignoring', 'going blocking',
    'going allowing', 'going permitting', 'going denying', 'going rejecting',
    'going accepting', 'going approving', 'going declining', 'going confirming',
    'going canceling', 'going okaying', 'going saying yes', 'going saying no',
    'going setting true', 'going setting false', 'going turning on', 'going turning off'
  ];

  static classifyMessage(message: string): MessageIntent {
    console.log('[MessageClassifier] Classifying message:', message);
    const lowerMessage = message.toLowerCase().trim();
    const words = lowerMessage.split(/\s+/);
    console.log('[MessageClassifier] Lower message:', lowerMessage);
    
    // Detect language preferences using the main language detector
    const languageDetection = detectLanguage(lowerMessage);
    const detectedLanguage = languageDetection.language;
    const languagePreferences = this.extractLanguagePreferences(lowerMessage);
    
    // Cursor-like behavior: Very short messages are always conversational
    if (message.length <= 3) {
      return {
        shouldGenerateCode: false,
        intent: 'greeting',
        confidence: 0.9,
        response: this.getGreetingResponse(message),
        detectedLanguage,
        languagePreferences
      };
    }

    // Cursor-like behavior: Single word messages are usually questions or greetings
    if (words.length === 1) {
      if (this.greetings.some(greeting => lowerMessage.includes(greeting))) {
        return {
          shouldGenerateCode: false,
          intent: 'greeting',
          confidence: 0.9,
          response: this.getGreetingResponse(message),
          detectedLanguage,
          languagePreferences
        };
      }
      return {
        shouldGenerateCode: false,
        intent: 'clarification',
        confidence: 0.7,
        response: this.getClarificationResponse(message),
        detectedLanguage,
        languagePreferences
      };
    }

    // Cursor-like behavior: Check for greetings first
    if (this.greetings.some(greeting => lowerMessage.includes(greeting))) {
      return {
        shouldGenerateCode: false,
        intent: 'greeting',
        confidence: 0.9,
        response: this.getGreetingResponse(message),
        detectedLanguage,
        languagePreferences
      };
    }

    // Cursor-like behavior: Check for specific portfolio creation patterns FIRST (highest priority)
    const portfolioPatterns = [
      /creat\s+(?:a\s+)?(?:full\s+stack\s+)?(?:web)?portfolio/i,
      /build\s+(?:a\s+)?(?:full\s+stack\s+)?(?:web)?portfolio/i,
      /make\s+(?:a\s+)?(?:full\s+stack\s+)?(?:web)?portfolio/i,
      /generate\s+(?:a\s+)?(?:full\s+stack\s+)?(?:web)?portfolio/i,
      /develop\s+(?:a\s+)?(?:full\s+stack\s+)?(?:web)?portfolio/i
    ];
    
    if (portfolioPatterns.some(pattern => pattern.test(lowerMessage))) {
      console.log('[MessageClassifier] Found portfolio creation request - HIGH PRIORITY');
      return {
        shouldGenerateCode: true,
        intent: 'code_request',
        confidence: 0.98,
        detectedLanguage,
        languagePreferences
      };
    }



    // Cursor-like behavior: Check for "please" requests that are clearly code generation
    if (lowerMessage.startsWith('please')) {
      console.log('[MessageClassifier] Found "please" request');
      const codeKeywords = [
        // Core actions
        'make', 'create', 'creat', 'build', 'generate', 'develop', 'code', 'program', 'script',
        'add', 'modify', 'change', 'update', 'edit', 'improve', 'enhance', 'fix', 'adjust',
        'remove', 'delete', 'replace', 'insert', 'append', 'prepend', 'swap', 'move',
        'tweak', 'refine', 'polish', 'beautify', 'modernize', 'redesign', 'restyle', 'retheme',
        'implement', 'integrate', 'connect', 'link', 'bind', 'hook', 'attach', 'detach',
        'configure', 'setup', 'install', 'deploy', 'publish', 'release', 'launch', 'go live',
        
        // Application types
        'app', 'application', 'website', 'webapp', 'web app', 'site', 'webpage', 'web page',
        'project', 'portfolio', 'webportfolio', 'web portfolio', 'developer portfolio',
        'landing page', 'homepage', 'home page', 'blog', 'ecommerce', 'e-commerce', 'shop',
        'store', 'marketplace', 'dashboard', 'admin panel', 'cms', 'content management',
        'social media', 'social network', 'forum', 'chat app', 'messaging', 'email client',
        'calendar', 'todo', 'task manager', 'note taking', 'file manager', 'gallery',
        'photo album', 'video player', 'music player', 'game', 'quiz', 'survey', 'form',
        'calculator', 'converter', 'generator', 'analyzer', 'tracker', 'monitor', 'logger',
        
        // Development frameworks
        'react', 'vue', 'angular', 'svelte', 'next.js', 'nextjs', 'nuxt', 'gatsby',
        'node', 'express', 'fastify', 'koa', 'hapi', 'nest', 'nestjs', 'adonis',
        'python', 'django', 'flask', 'fastapi', 'bottle', 'tornado', 'aiohttp',
        'php', 'laravel', 'symfony', 'codeigniter', 'yii', 'cakephp', 'zend',
        'java', 'spring', 'spring boot', 'springboot', 'quarkus', 'micronaut',
        'c#', 'csharp', '.net', 'dotnet', 'asp.net', 'aspnet', 'blazor', 'xamarin',
        'ruby', 'rails', 'sinatra', 'hanami', 'grape', 'jekyll', 'middleman',
        'go', 'golang', 'gin', 'echo', 'fiber', 'chi', 'mux', 'beego',
        'rust', 'actix', 'rocket', 'warp', 'axum', 'tonic', 'serde',
        'swift', 'ios', 'xcode', 'cocoa', 'swiftui', 'uikit', 'appkit',
        'kotlin', 'android', 'android studio', 'jetpack', 'compose', 'room',
        'flutter', 'dart', 'material', 'cupertino', 'widget', 'state management',
        'react native', 'expo', 'meteor', 'ionic', 'cordova', 'phonegap',
        'electron', 'tauri', 'nw.js', 'nwjs', 'neutralino', 'quasar',
        
        // Frontend technologies
        'html', 'css', 'scss', 'sass', 'less', 'stylus', 'postcss', 'tailwind',
        'bootstrap', 'bulma', 'foundation', 'semantic ui', 'material ui', 'ant design',
        'chakra ui', 'mantine', 'headless ui', 'radix ui', 'framer motion',
        'javascript', 'js', 'typescript', 'ts', 'es6', 'es2015', 'es2016', 'es2017',
        'es2018', 'es2019', 'es2020', 'es2021', 'es2022', 'es2023', 'esnext',
        'jquery', 'lodash', 'underscore', 'moment', 'dayjs', 'date-fns',
        'webpack', 'vite', 'parcel', 'rollup', 'esbuild', 'swc', 'babel',
        'jest', 'vitest', 'mocha', 'chai', 'cypress', 'playwright', 'selenium',
        'storybook', 'chromatic', 'loki', 'axe', 'pa11y', 'lighthouse',
        
        // Backend technologies
        'api', 'rest', 'restful', 'graphql', 'grpc', 'soap', 'websocket', 'socket.io',
        'authentication', 'auth', 'authorization', 'jwt', 'oauth', 'oauth2', 'saml',
        'ldap', 'active directory', 'openid', 'oidc', 'passport', 'next-auth',
        'database', 'db', 'sql', 'nosql', 'mysql', 'postgresql', 'postgres', 'sqlite',
        'mongodb', 'redis', 'elasticsearch', 'cassandra', 'dynamodb', 'firestore',
        'prisma', 'sequelize', 'typeorm', 'mongoose', 'knex', 'bookshelf',
        'firebase', 'supabase', 'auth0', 'cognito', 'appwrite', 'nhost',
        
        // UI/UX and Design
        'ui', 'ux', 'user interface', 'user experience', 'design', 'design system',
        'component', 'widget', 'element', 'module', 'block', 'section', 'area',
        'header', 'hero', 'banner', 'main', 'content', 'sidebar', 'footer',
        'navigation', 'nav', 'menu', 'dropdown', 'tabs', 'accordion', 'modal',
        'popup', 'tooltip', 'notification', 'alert', 'toast', 'snackbar',
        'card', 'grid', 'list', 'table', 'form', 'input', 'button', 'link',
        'text', 'title', 'heading', 'subtitle', 'description', 'caption',
        'picture', 'image', 'photo', 'img', 'logo', 'icon', 'avatar', 'thumbnail',
        'background', 'bg', 'color', 'colour', 'theme', 'palette', 'gradient',
        'styling', 'css', 'style', 'look', 'appearance', 'visual', 'aesthetic',
        'professional', 'modern', 'clean', 'minimal', 'elegant', 'beautiful',
        'responsive', 'mobile', 'desktop', 'tablet', 'screen', 'viewport',
        'layout', 'structure', 'arrangement', 'organization', 'composition',
        'alignment', 'centered', 'left', 'right', 'top', 'bottom', 'middle',
        'flex', 'grid', 'position', 'absolute', 'relative', 'fixed', 'sticky',
        'margin', 'padding', 'border', 'shadow', 'animation', 'transition',
        'hover', 'focus', 'active', 'interaction', 'feedback', 'loading',
        'spinner', 'progress', 'skeleton', 'placeholder', 'empty state',
        
        // Features and functionality
        'feature', 'function', 'functionality', 'capability', 'ability', 'option',
        'search', 'filter', 'sort', 'paginate', 'infinite scroll', 'lazy load',
        'upload', 'download', 'export', 'import', 'backup', 'restore', 'sync',
        'chat', 'comment', 'like', 'share', 'follow', 'subscribe', 'bookmark',
        'favorite', 'rate', 'review', 'vote', 'poll', 'survey', 'quiz',
        'notification', 'email', 'sms', 'push', 'webhook', 'cron', 'scheduler',
        'analytics', 'tracking', 'monitoring', 'logging', 'debugging', 'testing',
        'performance', 'optimization', 'caching', 'cdn', 'compression', 'minification',
        'seo', 'accessibility', 'a11y', 'security', 'privacy', 'gdpr', 'compliance',
        
        // Business and content
        'business', 'company', 'startup', 'enterprise', 'corporate', 'professional',
        'personal', 'portfolio', 'resume', 'cv', 'about', 'contact', 'team',
        'services', 'products', 'pricing', 'plans', 'subscription', 'billing',
        'payment', 'checkout', 'cart', 'order', 'invoice', 'receipt', 'refund',
        'customer', 'client', 'user', 'admin', 'moderator', 'manager', 'owner',
        'profile', 'account', 'settings', 'preferences', 'configuration',
        'content', 'article', 'post', 'page', 'blog', 'news', 'media', 'file',
        'document', 'pdf', 'image', 'video', 'audio', 'gallery', 'album',
        
        // Common misspellings
        'creat', 'buid', 'genrate', 'develp', 'websit', 'projct', 'componet',
        'featur', 'functon', 'databas', 'authenticaton', 'navigaton', 'responsiv',
        'portfolo', 'webportfolo', 'developr', 'programr', 'codr', 'designr',
        'pictur', 'imag', 'phot', 'log', 'icn', 'bannr', 'backgrond', 'colr',
        'them', 'stylng', 'look', 'appearanc', 'visul', 'professonal', 'bettr',
        'improv', 'enhanc', 'updat', 'chang', 'modfy', 'add', 'remov', 'replac',
        'fix', 'adjust', 'tweak', 'refin', 'polsh', 'beautfy', 'moderniz', 'redsign',
        'restyl', 'rethem', 'pag', 'secton', 'ara', 'part', 'porton', 'segmnt',
        'divison', 'headr', 'her', 'main', 'contnt', 'sidebr', 'footr', 'nav',
        'navigaton', 'men', 'dropdwn', 'tabs', 'cards', 'grd', 'lst', 'tbl',
        'form', 'inpt', 'buton', 'lnk', 'txt', 'ttl', 'headng', 'subtitl',
        'descripton', 'capton', 'fnt', 'typograpy', 'siz', 'wght', 'spacng',
        'margn', 'paddng', 'bordr', 'shadw', 'gradint', 'animaton', 'transiton',
        'hovr', 'focs', 'actv', 'responsiv', 'mobl', 'desktp', 'tablt', 'scrn',
        'viewprt', 'breakpont', 'layot', 'structr', 'arrangmnt', 'organzaton',
        'compositon', 'algnment', 'centrd', 'lft', 'rght', 'top', 'bttm', 'middl',
        'centr', 'justfy', 'flx', 'grd', 'positon', 'absolt', 'relatv', 'fxd', 'stcky'
      ];
      const foundKeywords = codeKeywords.filter(keyword => lowerMessage.includes(keyword));
      console.log('[MessageClassifier] Found keywords in "please" check:', foundKeywords);
      if (foundKeywords.length > 0) {
        console.log('[MessageClassifier] Returning code request for "please"');
        return {
          shouldGenerateCode: true,
          intent: 'code_request',
          confidence: 0.95,
          detectedLanguage,
          languagePreferences
        };
      }
    }

    // Cursor-like behavior: Check for "can you" requests that are clearly code generation
    if (lowerMessage.startsWith('can you') || lowerMessage.startsWith('could you')) {
      console.log('[MessageClassifier] Found "can you" request');
      const codeKeywords = [
        // Core actions
        'make', 'create', 'creat', 'build', 'generate', 'develop', 'code', 'program', 'script',
        'add', 'modify', 'change', 'update', 'edit', 'improve', 'enhance', 'fix', 'adjust',
        'remove', 'delete', 'replace', 'insert', 'append', 'prepend', 'swap', 'move',
        'tweak', 'refine', 'polish', 'beautify', 'modernize', 'redesign', 'restyle', 'retheme',
        'implement', 'integrate', 'connect', 'link', 'bind', 'hook', 'attach', 'detach',
        'configure', 'setup', 'install', 'deploy', 'publish', 'release', 'launch', 'go live',
        
        // Application types
        'app', 'application', 'website', 'webapp', 'web app', 'site', 'webpage', 'web page',
        'project', 'portfolio', 'webportfolio', 'web portfolio', 'developer portfolio',
        'landing page', 'homepage', 'home page', 'blog', 'ecommerce', 'e-commerce', 'shop',
        'store', 'marketplace', 'dashboard', 'admin panel', 'cms', 'content management',
        'social media', 'social network', 'forum', 'chat app', 'messaging', 'email client',
        'calendar', 'todo', 'task manager', 'note taking', 'file manager', 'gallery',
        'photo album', 'video player', 'music player', 'game', 'quiz', 'survey', 'form',
        'calculator', 'converter', 'generator', 'analyzer', 'tracker', 'monitor', 'logger',
        
        // Development frameworks
        'react', 'vue', 'angular', 'svelte', 'next.js', 'nextjs', 'nuxt', 'gatsby',
        'node', 'express', 'fastify', 'koa', 'hapi', 'nest', 'nestjs', 'adonis',
        'python', 'django', 'flask', 'fastapi', 'bottle', 'tornado', 'aiohttp',
        'php', 'laravel', 'symfony', 'codeigniter', 'yii', 'cakephp', 'zend',
        'java', 'spring', 'spring boot', 'springboot', 'quarkus', 'micronaut',
        'c#', 'csharp', '.net', 'dotnet', 'asp.net', 'aspnet', 'blazor', 'xamarin',
        'ruby', 'rails', 'sinatra', 'hanami', 'grape', 'jekyll', 'middleman',
        'go', 'golang', 'gin', 'echo', 'fiber', 'chi', 'mux', 'beego',
        'rust', 'actix', 'rocket', 'warp', 'axum', 'tonic', 'serde',
        'swift', 'ios', 'xcode', 'cocoa', 'swiftui', 'uikit', 'appkit',
        'kotlin', 'android', 'android studio', 'jetpack', 'compose', 'room',
        'flutter', 'dart', 'material', 'cupertino', 'widget', 'state management',
        'react native', 'expo', 'meteor', 'ionic', 'cordova', 'phonegap',
        'electron', 'tauri', 'nw.js', 'nwjs', 'neutralino', 'quasar',
        
        // Frontend technologies
        'html', 'css', 'scss', 'sass', 'less', 'stylus', 'postcss', 'tailwind',
        'bootstrap', 'bulma', 'foundation', 'semantic ui', 'material ui', 'ant design',
        'chakra ui', 'mantine', 'headless ui', 'radix ui', 'framer motion',
        'javascript', 'js', 'typescript', 'ts', 'es6', 'es2015', 'es2016', 'es2017',
        'es2018', 'es2019', 'es2020', 'es2021', 'es2022', 'es2023', 'esnext',
        'jquery', 'lodash', 'underscore', 'moment', 'dayjs', 'date-fns',
        'webpack', 'vite', 'parcel', 'rollup', 'esbuild', 'swc', 'babel',
        'jest', 'vitest', 'mocha', 'chai', 'cypress', 'playwright', 'selenium',
        'storybook', 'chromatic', 'loki', 'axe', 'pa11y', 'lighthouse',
        
        // Backend technologies
        'api', 'rest', 'restful', 'graphql', 'grpc', 'soap', 'websocket', 'socket.io',
        'authentication', 'auth', 'authorization', 'jwt', 'oauth', 'oauth2', 'saml',
        'ldap', 'active directory', 'openid', 'oidc', 'passport', 'next-auth',
        'database', 'db', 'sql', 'nosql', 'mysql', 'postgresql', 'postgres', 'sqlite',
        'mongodb', 'redis', 'elasticsearch', 'cassandra', 'dynamodb', 'firestore',
        'prisma', 'sequelize', 'typeorm', 'mongoose', 'knex', 'bookshelf',
        'firebase', 'supabase', 'auth0', 'cognito', 'appwrite', 'nhost',
        
        // UI/UX and Design
        'ui', 'ux', 'user interface', 'user experience', 'design', 'design system',
        'component', 'widget', 'element', 'module', 'block', 'section', 'area',
        'header', 'hero', 'banner', 'main', 'content', 'sidebar', 'footer',
        'navigation', 'nav', 'menu', 'dropdown', 'tabs', 'accordion', 'modal',
        'popup', 'tooltip', 'notification', 'alert', 'toast', 'snackbar',
        'card', 'grid', 'list', 'table', 'form', 'input', 'button', 'link',
        'text', 'title', 'heading', 'subtitle', 'description', 'caption',
        'picture', 'image', 'photo', 'img', 'logo', 'icon', 'avatar', 'thumbnail',
        'background', 'bg', 'color', 'colour', 'theme', 'palette', 'gradient',
        'styling', 'css', 'style', 'look', 'appearance', 'visual', 'aesthetic',
        'professional', 'modern', 'clean', 'minimal', 'elegant', 'beautiful',
        'responsive', 'mobile', 'desktop', 'tablet', 'screen', 'viewport',
        'layout', 'structure', 'arrangement', 'organization', 'composition',
        'alignment', 'centered', 'left', 'right', 'top', 'bottom', 'middle',
        'flex', 'grid', 'position', 'absolute', 'relative', 'fixed', 'sticky',
        'margin', 'padding', 'border', 'shadow', 'animation', 'transition',
        'hover', 'focus', 'active', 'interaction', 'feedback', 'loading',
        'spinner', 'progress', 'skeleton', 'placeholder', 'empty state',
        
        // Features and functionality
        'feature', 'function', 'functionality', 'capability', 'ability', 'option',
        'search', 'filter', 'sort', 'paginate', 'infinite scroll', 'lazy load',
        'upload', 'download', 'export', 'import', 'backup', 'restore', 'sync',
        'chat', 'comment', 'like', 'share', 'follow', 'subscribe', 'bookmark',
        'favorite', 'rate', 'review', 'vote', 'poll', 'survey', 'quiz',
        'notification', 'email', 'sms', 'push', 'webhook', 'cron', 'scheduler',
        'analytics', 'tracking', 'monitoring', 'logging', 'debugging', 'testing',
        'performance', 'optimization', 'caching', 'cdn', 'compression', 'minification',
        'seo', 'accessibility', 'a11y', 'security', 'privacy', 'gdpr', 'compliance',
        
        // Business and content
        'business', 'company', 'startup', 'enterprise', 'corporate', 'professional',
        'personal', 'portfolio', 'resume', 'cv', 'about', 'contact', 'team',
        'services', 'products', 'pricing', 'plans', 'subscription', 'billing',
        'payment', 'checkout', 'cart', 'order', 'invoice', 'receipt', 'refund',
        'customer', 'client', 'user', 'admin', 'moderator', 'manager', 'owner',
        'profile', 'account', 'settings', 'preferences', 'configuration',
        'content', 'article', 'post', 'page', 'blog', 'news', 'media', 'file',
        'document', 'pdf', 'image', 'video', 'audio', 'gallery', 'album',
        
        // Common misspellings
        'creat', 'buid', 'genrate', 'develp', 'websit', 'projct', 'componet',
        'featur', 'functon', 'databas', 'authenticaton', 'navigaton', 'responsiv',
        'portfolo', 'webportfolo', 'developr', 'programr', 'codr', 'designr',
        'pictur', 'imag', 'phot', 'log', 'icn', 'bannr', 'backgrond', 'colr',
        'them', 'stylng', 'look', 'appearanc', 'visul', 'professonal', 'bettr',
        'improv', 'enhanc', 'updat', 'chang', 'modfy', 'add', 'remov', 'replac',
        'fix', 'adjust', 'tweak', 'refin', 'polsh', 'beautfy', 'moderniz', 'redsign',
        'restyl', 'rethem', 'pag', 'secton', 'ara', 'part', 'porton', 'segmnt',
        'divison', 'headr', 'her', 'main', 'contnt', 'sidebr', 'footr', 'nav',
        'navigaton', 'men', 'dropdwn', 'tabs', 'cards', 'grd', 'lst', 'tbl',
        'form', 'inpt', 'buton', 'lnk', 'txt', 'ttl', 'headng', 'subtitl',
        'descripton', 'capton', 'fnt', 'typograpy', 'siz', 'wght', 'spacng',
        'margn', 'paddng', 'bordr', 'shadw', 'gradint', 'animaton', 'transiton',
        'hovr', 'focs', 'actv', 'responsiv', 'mobl', 'desktp', 'tablt', 'scrn',
        'viewprt', 'breakpont', 'layot', 'structr', 'arrangmnt', 'organzaton',
        'compositon', 'algnment', 'centrd', 'lft', 'rght', 'top', 'bttm', 'middl',
        'centr', 'justfy', 'flx', 'grd', 'positon', 'absolt', 'relatv', 'fxd', 'stcky'
      ];
      const foundKeywords = codeKeywords.filter(keyword => lowerMessage.includes(keyword));
      console.log('[MessageClassifier] Found keywords in "can you" check:', foundKeywords);
      if (foundKeywords.length > 0) {
        console.log('[MessageClassifier] Returning code request for "can you"');
        return {
          shouldGenerateCode: true,
          intent: 'code_request',
          confidence: 0.95,
          detectedLanguage,
          languagePreferences
        };
      }
    }

    // Cursor-like behavior: Help requests are always conversational
    if (lowerMessage.includes('help') && message.length < 30) {
      return {
        shouldGenerateCode: false,
        intent: 'question',
        confidence: 0.9,
        response: this.getHelpResponse(),
        detectedLanguage,
        languagePreferences
      };
    }
    
    // Cursor-like behavior: Questions are conversational unless they contain code keywords
    if (this.questions.some(question => lowerMessage.includes(question))) {
      // But if it also contains code keywords, it's a code request
      if (this.codeKeywords.some(keyword => lowerMessage.includes(keyword))) {
        return {
          shouldGenerateCode: true,
          intent: 'code_request',
          confidence: 0.9
        };
      }
      // Check for high confidence code generation keywords even in questions
      const highConfidenceKeywords = [
        // Core actions
        'create', 'creat', 'build', 'make', 'generate', 'develop', 'code', 'program', 'script',
        'add', 'modify', 'change', 'update', 'edit', 'improve', 'enhance', 'fix', 'adjust',
        'remove', 'delete', 'replace', 'insert', 'append', 'prepend', 'swap', 'move',
        'tweak', 'refine', 'polish', 'beautify', 'modernize', 'redesign', 'restyle', 'retheme',
        'implement', 'integrate', 'connect', 'link', 'bind', 'hook', 'attach', 'detach',
        'configure', 'setup', 'install', 'deploy', 'publish', 'release', 'launch', 'go live',
        
        // Application types
        'app', 'application', 'website', 'webapp', 'web app', 'site', 'webpage', 'web page',
        'project', 'portfolio', 'webportfolio', 'web portfolio', 'developer portfolio',
        'landing page', 'homepage', 'home page', 'blog', 'ecommerce', 'e-commerce', 'shop',
        'store', 'marketplace', 'dashboard', 'admin panel', 'cms', 'content management',
        'social media', 'social network', 'forum', 'chat app', 'messaging', 'email client',
        'calendar', 'todo', 'task manager', 'note taking', 'file manager', 'gallery',
        'photo album', 'video player', 'music player', 'game', 'quiz', 'survey', 'form',
        'calculator', 'converter', 'generator', 'analyzer', 'tracker', 'monitor', 'logger',
        
        // Development frameworks
        'react', 'vue', 'angular', 'svelte', 'next.js', 'nextjs', 'nuxt', 'gatsby',
        'node', 'express', 'fastify', 'koa', 'hapi', 'nest', 'nestjs', 'adonis',
        'python', 'django', 'flask', 'fastapi', 'bottle', 'tornado', 'aiohttp',
        'php', 'laravel', 'symfony', 'codeigniter', 'yii', 'cakephp', 'zend',
        'java', 'spring', 'spring boot', 'springboot', 'quarkus', 'micronaut',
        'c#', 'csharp', '.net', 'dotnet', 'asp.net', 'aspnet', 'blazor', 'xamarin',
        'ruby', 'rails', 'sinatra', 'hanami', 'grape', 'jekyll', 'middleman',
        'go', 'golang', 'gin', 'echo', 'fiber', 'chi', 'mux', 'beego',
        'rust', 'actix', 'rocket', 'warp', 'axum', 'tonic', 'serde',
        'swift', 'ios', 'xcode', 'cocoa', 'swiftui', 'uikit', 'appkit',
        'kotlin', 'android', 'android studio', 'jetpack', 'compose', 'room',
        'flutter', 'dart', 'material', 'cupertino', 'widget', 'state management',
        'react native', 'expo', 'meteor', 'ionic', 'cordova', 'phonegap',
        'electron', 'tauri', 'nw.js', 'nwjs', 'neutralino', 'quasar',
        
        // Frontend technologies
        'html', 'css', 'scss', 'sass', 'less', 'stylus', 'postcss', 'tailwind',
        'bootstrap', 'bulma', 'foundation', 'semantic ui', 'material ui', 'ant design',
        'chakra ui', 'mantine', 'headless ui', 'radix ui', 'framer motion',
        'javascript', 'js', 'typescript', 'ts', 'es6', 'es2015', 'es2016', 'es2017',
        'es2018', 'es2019', 'es2020', 'es2021', 'es2022', 'es2023', 'esnext',
        'jquery', 'lodash', 'underscore', 'moment', 'dayjs', 'date-fns',
        'webpack', 'vite', 'parcel', 'rollup', 'esbuild', 'swc', 'babel',
        'jest', 'vitest', 'mocha', 'chai', 'cypress', 'playwright', 'selenium',
        'storybook', 'chromatic', 'loki', 'axe', 'pa11y', 'lighthouse',
        
        // Backend technologies
        'api', 'rest', 'restful', 'graphql', 'grpc', 'soap', 'websocket', 'socket.io',
        'authentication', 'auth', 'authorization', 'jwt', 'oauth', 'oauth2', 'saml',
        'ldap', 'active directory', 'openid', 'oidc', 'passport', 'next-auth',
        'database', 'db', 'sql', 'nosql', 'mysql', 'postgresql', 'postgres', 'sqlite',
        'mongodb', 'redis', 'elasticsearch', 'cassandra', 'dynamodb', 'firestore',
        'prisma', 'sequelize', 'typeorm', 'mongoose', 'knex', 'bookshelf',
        'firebase', 'supabase', 'auth0', 'cognito', 'appwrite', 'nhost',
        
        // UI/UX and Design
        'ui', 'ux', 'user interface', 'user experience', 'design', 'design system',
        'component', 'widget', 'element', 'module', 'block', 'section', 'area',
        'header', 'hero', 'banner', 'main', 'content', 'sidebar', 'footer',
        'navigation', 'nav', 'menu', 'dropdown', 'tabs', 'accordion', 'modal',
        'popup', 'tooltip', 'notification', 'alert', 'toast', 'snackbar',
        'card', 'grid', 'list', 'table', 'form', 'input', 'button', 'link',
        'text', 'title', 'heading', 'subtitle', 'description', 'caption',
        'picture', 'image', 'photo', 'img', 'logo', 'icon', 'avatar', 'thumbnail',
        'background', 'bg', 'color', 'colour', 'theme', 'palette', 'gradient',
        'styling', 'css', 'style', 'look', 'appearance', 'visual', 'aesthetic',
        'professional', 'modern', 'clean', 'minimal', 'elegant', 'beautiful',
        'responsive', 'mobile', 'desktop', 'tablet', 'screen', 'viewport',
        'layout', 'structure', 'arrangement', 'organization', 'composition',
        'alignment', 'centered', 'left', 'right', 'top', 'bottom', 'middle',
        'flex', 'grid', 'position', 'absolute', 'relative', 'fixed', 'sticky',
        'margin', 'padding', 'border', 'shadow', 'animation', 'transition',
        'hover', 'focus', 'active', 'interaction', 'feedback', 'loading',
        'spinner', 'progress', 'skeleton', 'placeholder', 'empty state',
        
        // Features and functionality
        'feature', 'function', 'functionality', 'capability', 'ability', 'option',
        'search', 'filter', 'sort', 'paginate', 'infinite scroll', 'lazy load',
        'upload', 'download', 'export', 'import', 'backup', 'restore', 'sync',
        'chat', 'comment', 'like', 'share', 'follow', 'subscribe', 'bookmark',
        'favorite', 'rate', 'review', 'vote', 'poll', 'survey', 'quiz',
        'notification', 'email', 'sms', 'push', 'webhook', 'cron', 'scheduler',
        'analytics', 'tracking', 'monitoring', 'logging', 'debugging', 'testing',
        'performance', 'optimization', 'caching', 'cdn', 'compression', 'minification',
        'seo', 'accessibility', 'a11y', 'security', 'privacy', 'gdpr', 'compliance',
        
        // Business and content
        'business', 'company', 'startup', 'enterprise', 'corporate', 'professional',
        'personal', 'portfolio', 'resume', 'cv', 'about', 'contact', 'team',
        'services', 'products', 'pricing', 'plans', 'subscription', 'billing',
        'payment', 'checkout', 'cart', 'order', 'invoice', 'receipt', 'refund',
        'customer', 'client', 'user', 'admin', 'moderator', 'manager', 'owner',
        'profile', 'account', 'settings', 'preferences', 'configuration',
        'content', 'article', 'post', 'page', 'blog', 'news', 'media', 'file',
        'document', 'pdf', 'image', 'video', 'audio', 'gallery', 'album',
        
        // Common misspellings
        'creat', 'buid', 'genrate', 'develp', 'websit', 'projct', 'componet',
        'featur', 'functon', 'databas', 'authenticaton', 'navigaton', 'responsiv',
        'portfolo', 'webportfolo', 'developr', 'programr', 'codr', 'designr',
        'pictur', 'imag', 'phot', 'log', 'icn', 'bannr', 'backgrond', 'colr',
        'them', 'stylng', 'look', 'appearanc', 'visul', 'professonal', 'bettr',
        'improv', 'enhanc', 'updat', 'chang', 'modfy', 'add', 'remov', 'replac',
        'fix', 'adjust', 'tweak', 'refin', 'polsh', 'beautfy', 'moderniz', 'redsign',
        'restyl', 'rethem', 'pag', 'secton', 'ara', 'part', 'porton', 'segmnt',
        'divison', 'headr', 'her', 'main', 'contnt', 'sidebr', 'footr', 'nav',
        'navigaton', 'men', 'dropdwn', 'tabs', 'cards', 'grd', 'lst', 'tbl',
        'form', 'inpt', 'buton', 'lnk', 'txt', 'ttl', 'headng', 'subtitl',
        'descripton', 'capton', 'fnt', 'typograpy', 'siz', 'wght', 'spacng',
        'margn', 'paddng', 'bordr', 'shadw', 'gradint', 'animaton', 'transiton',
        'hovr', 'focs', 'actv', 'responsiv', 'mobl', 'desktp', 'tablt', 'scrn',
        'viewprt', 'breakpont', 'layot', 'structr', 'arrangmnt', 'organzaton',
        'compositon', 'algnment', 'centrd', 'lft', 'rght', 'top', 'bttm', 'middl',
        'centr', 'justfy', 'flx', 'grd', 'positon', 'absolt', 'relatv', 'fxd', 'stcky'
      ];
      if (highConfidenceKeywords.some(keyword => lowerMessage.includes(keyword))) {
        return {
          shouldGenerateCode: true,
          intent: 'code_request',
          confidence: 0.95,
          detectedLanguage,
          languagePreferences
        };
      }
      return {
        shouldGenerateCode: false,
        intent: 'question',
        confidence: 0.8,
        response: this.getQuestionResponse(message),
        detectedLanguage,
        languagePreferences
      };
    }

    // Cursor-like behavior: Commands are conversational
    if (this.commands.some(command => lowerMessage.includes(command))) {
      return {
        shouldGenerateCode: false,
        intent: 'command',
        confidence: 0.7,
        response: this.getCommandResponse(message),
        detectedLanguage,
        languagePreferences
      };
    }

    // Cursor-like behavior: High confidence code generation keywords
    const highConfidenceKeywords = [
      // Core actions
      'create', 'creat', 'build', 'make', 'generate', 'develop', 'code', 'program', 'script',
      'add', 'modify', 'change', 'update', 'edit', 'improve', 'enhance', 'fix', 'adjust',
      'remove', 'delete', 'replace', 'insert', 'append', 'prepend', 'swap', 'move',
      'tweak', 'refine', 'polish', 'beautify', 'modernize', 'redesign', 'restyle', 'retheme',
      'implement', 'integrate', 'connect', 'link', 'bind', 'hook', 'attach', 'detach',
      'configure', 'setup', 'install', 'deploy', 'publish', 'release', 'launch', 'go live',
      
      // Application types
      'app', 'application', 'website', 'webapp', 'web app', 'site', 'webpage', 'web page',
      'project', 'portfolio', 'webportfolio', 'web portfolio', 'developer portfolio',
      'landing page', 'homepage', 'home page', 'blog', 'ecommerce', 'e-commerce', 'shop',
      'store', 'marketplace', 'dashboard', 'admin panel', 'cms', 'content management',
      'social media', 'social network', 'forum', 'chat app', 'messaging', 'email client',
      'calendar', 'todo', 'task manager', 'note taking', 'file manager', 'gallery',
      'photo album', 'video player', 'music player', 'game', 'quiz', 'survey', 'form',
      'calculator', 'converter', 'generator', 'analyzer', 'tracker', 'monitor', 'logger',
      
      // Development frameworks
      'react', 'vue', 'angular', 'svelte', 'next.js', 'nextjs', 'nuxt', 'gatsby',
      'node', 'express', 'fastify', 'koa', 'hapi', 'nest', 'nestjs', 'adonis',
      'python', 'django', 'flask', 'fastapi', 'bottle', 'tornado', 'aiohttp',
      'php', 'laravel', 'symfony', 'codeigniter', 'yii', 'cakephp', 'zend',
      'java', 'spring', 'spring boot', 'springboot', 'quarkus', 'micronaut',
      'c#', 'csharp', '.net', 'dotnet', 'asp.net', 'aspnet', 'blazor', 'xamarin',
      'ruby', 'rails', 'sinatra', 'hanami', 'grape', 'jekyll', 'middleman',
      'go', 'golang', 'gin', 'echo', 'fiber', 'chi', 'mux', 'beego',
      'rust', 'actix', 'rocket', 'warp', 'axum', 'tonic', 'serde',
      'swift', 'ios', 'xcode', 'cocoa', 'swiftui', 'uikit', 'appkit',
      'kotlin', 'android', 'android studio', 'jetpack', 'compose', 'room',
      'flutter', 'dart', 'material', 'cupertino', 'widget', 'state management',
      'react native', 'expo', 'meteor', 'ionic', 'cordova', 'phonegap',
      'electron', 'tauri', 'nw.js', 'nwjs', 'neutralino', 'quasar',
      
      // Frontend technologies
      'html', 'css', 'scss', 'sass', 'less', 'stylus', 'postcss', 'tailwind',
      'bootstrap', 'bulma', 'foundation', 'semantic ui', 'material ui', 'ant design',
      'chakra ui', 'mantine', 'headless ui', 'radix ui', 'framer motion',
      'javascript', 'js', 'typescript', 'ts', 'es6', 'es2015', 'es2016', 'es2017',
      'es2018', 'es2019', 'es2020', 'es2021', 'es2022', 'es2023', 'esnext',
      'jquery', 'lodash', 'underscore', 'moment', 'dayjs', 'date-fns',
      'webpack', 'vite', 'parcel', 'rollup', 'esbuild', 'swc', 'babel',
      'jest', 'vitest', 'mocha', 'chai', 'cypress', 'playwright', 'selenium',
      'storybook', 'chromatic', 'loki', 'axe', 'pa11y', 'lighthouse',
      
      // Backend technologies
      'api', 'rest', 'restful', 'graphql', 'grpc', 'soap', 'websocket', 'socket.io',
      'authentication', 'auth', 'authorization', 'jwt', 'oauth', 'oauth2', 'saml',
      'ldap', 'active directory', 'openid', 'oidc', 'passport', 'next-auth',
      'database', 'db', 'sql', 'nosql', 'mysql', 'postgresql', 'postgres', 'sqlite',
      'mongodb', 'redis', 'elasticsearch', 'cassandra', 'dynamodb', 'firestore',
      'prisma', 'sequelize', 'typeorm', 'mongoose', 'knex', 'bookshelf',
      'firebase', 'supabase', 'auth0', 'cognito', 'appwrite', 'nhost',
      
      // UI/UX and Design
      'ui', 'ux', 'user interface', 'user experience', 'design', 'design system',
      'component', 'widget', 'element', 'module', 'block', 'section', 'area',
      'header', 'hero', 'banner', 'main', 'content', 'sidebar', 'footer',
      'navigation', 'nav', 'menu', 'dropdown', 'tabs', 'accordion', 'modal',
      'popup', 'tooltip', 'notification', 'alert', 'toast', 'snackbar',
      'card', 'grid', 'list', 'table', 'form', 'input', 'button', 'link',
      'text', 'title', 'heading', 'subtitle', 'description', 'caption',
      'picture', 'image', 'photo', 'img', 'logo', 'icon', 'avatar', 'thumbnail',
      'background', 'bg', 'color', 'colour', 'theme', 'palette', 'gradient',
      'styling', 'css', 'style', 'look', 'appearance', 'visual', 'aesthetic',
      'professional', 'modern', 'clean', 'minimal', 'elegant', 'beautiful',
      'responsive', 'mobile', 'desktop', 'tablet', 'screen', 'viewport',
      'layout', 'structure', 'arrangement', 'organization', 'composition',
      'alignment', 'centered', 'left', 'right', 'top', 'bottom', 'middle',
      'flex', 'grid', 'position', 'absolute', 'relative', 'fixed', 'sticky',
      'margin', 'padding', 'border', 'shadow', 'animation', 'transition',
      'hover', 'focus', 'active', 'interaction', 'feedback', 'loading',
      'spinner', 'progress', 'skeleton', 'placeholder', 'empty state',
      
      // Features and functionality
      'feature', 'function', 'functionality', 'capability', 'ability', 'option',
      'search', 'filter', 'sort', 'paginate', 'infinite scroll', 'lazy load',
      'upload', 'download', 'export', 'import', 'backup', 'restore', 'sync',
      'chat', 'comment', 'like', 'share', 'follow', 'subscribe', 'bookmark',
      'favorite', 'rate', 'review', 'vote', 'poll', 'survey', 'quiz',
      'notification', 'email', 'sms', 'push', 'webhook', 'cron', 'scheduler',
      'analytics', 'tracking', 'monitoring', 'logging', 'debugging', 'testing',
      'performance', 'optimization', 'caching', 'cdn', 'compression', 'minification',
      'seo', 'accessibility', 'a11y', 'security', 'privacy', 'gdpr', 'compliance',
      
      // Business and content
      'business', 'company', 'startup', 'enterprise', 'corporate', 'professional',
      'personal', 'portfolio', 'resume', 'cv', 'about', 'contact', 'team',
      'services', 'products', 'pricing', 'plans', 'subscription', 'billing',
      'payment', 'checkout', 'cart', 'order', 'invoice', 'receipt', 'refund',
      'customer', 'client', 'user', 'admin', 'moderator', 'manager', 'owner',
      'profile', 'account', 'settings', 'preferences', 'configuration',
      'content', 'article', 'post', 'page', 'blog', 'news', 'media', 'file',
      'document', 'pdf', 'image', 'video', 'audio', 'gallery', 'album',
      
      // Common misspellings
      'creat', 'buid', 'genrate', 'develp', 'websit', 'projct', 'componet',
      'featur', 'functon', 'databas', 'authenticaton', 'navigaton', 'responsiv',
      'portfolo', 'webportfolo', 'developr', 'programr', 'codr', 'designr',
      'pictur', 'imag', 'phot', 'log', 'icn', 'bannr', 'backgrond', 'colr',
      'them', 'stylng', 'look', 'appearanc', 'visul', 'professonal', 'bettr',
      'improv', 'enhanc', 'updat', 'chang', 'modfy', 'add', 'remov', 'replac',
      'fix', 'adjust', 'tweak', 'refin', 'polsh', 'beautfy', 'moderniz', 'redsign',
      'restyl', 'rethem', 'pag', 'secton', 'ara', 'part', 'porton', 'segmnt',
      'divison', 'headr', 'her', 'main', 'contnt', 'sidebr', 'footr', 'nav',
      'navigaton', 'men', 'dropdwn', 'tabs', 'cards', 'grd', 'lst', 'tbl',
      'form', 'inpt', 'buton', 'lnk', 'txt', 'ttl', 'headng', 'subtitl',
      'descripton', 'capton', 'fnt', 'typograpy', 'siz', 'wght', 'spacng',
      'margn', 'paddng', 'bordr', 'shadw', 'gradint', 'animaton', 'transiton',
      'hovr', 'focs', 'actv', 'responsiv', 'mobl', 'desktp', 'tablt', 'scrn',
      'viewprt', 'breakpont', 'layot', 'structr', 'arrangmnt', 'organzaton',
      'compositon', 'algnment', 'centrd', 'lft', 'rght', 'top', 'bttm', 'middl',
      'centr', 'justfy', 'flx', 'grd', 'positon', 'absolt', 'relatv', 'fxd', 'stcky'
    ];
    const foundHighConfidenceKeywords = highConfidenceKeywords.filter(keyword => lowerMessage.includes(keyword));
    console.log('[MessageClassifier] High confidence keywords found:', foundHighConfidenceKeywords);
    if (foundHighConfidenceKeywords.length > 0) {
      console.log('[MessageClassifier] Returning code request for high confidence keywords');
      return {
        shouldGenerateCode: true,
        intent: 'code_request',
        confidence: 0.95,
        detectedLanguage,
        languagePreferences
      };
    }

    // Cursor-like behavior: Design and UI improvement requests
    const designKeywords = ['picture', 'image', 'photo', 'logo', 'color', 'colour', 'theme', 'styling', 'look', 'appearance', 'visual', 'professional', 'better', 'improve', 'enhance', 'update', 'change', 'modify', 'add', 'remove', 'replace', 'fix', 'adjust', 'tweak', 'refine', 'polish', 'beautify', 'modernize', 'redesign', 'restyle', 'retheme'];
    if (designKeywords.some(keyword => lowerMessage.includes(keyword))) {
      return {
        shouldGenerateCode: true,
        intent: 'code_request',
        confidence: 0.9
      };
    }

    // Cursor-like behavior: Page/section requests
    if (lowerMessage.includes('page') || lowerMessage.includes('pages') || lowerMessage.includes('section')) {
      return {
        shouldGenerateCode: true,
        intent: 'code_request',
        confidence: 0.85
      };
    }

    // Cursor-like behavior: Other code generation requests
    if (this.codeKeywords.some(keyword => lowerMessage.includes(keyword))) {
      return {
        shouldGenerateCode: true,
        intent: 'code_request',
        confidence: 0.8
      };
    }

    // Cursor-like behavior: Multi-line messages
    if (message.includes('\n')) {
      // If multi-line contains code keywords, it's a code request
      if (this.codeKeywords.some(keyword => lowerMessage.includes(keyword))) {
        return {
          shouldGenerateCode: true,
          intent: 'code_request',
          confidence: 0.9
        };
      }
      // Short multi-line messages are questions
      if (message.length <= 100) {
        return {
          shouldGenerateCode: false,
          intent: 'question',
          confidence: 0.7,
          response: this.getQuestionResponse(message)
        };
      }
      // Long multi-line messages are code requests
      return {
        shouldGenerateCode: true,
        intent: 'code_request',
        confidence: 0.8
      };
    }

    // Cursor-like behavior: Design improvement patterns
    if (lowerMessage.includes('not looking') || lowerMessage.includes('doesn\'t look') || lowerMessage.includes('does not look') || 
        lowerMessage.includes('make it') || lowerMessage.includes('make the') || lowerMessage.includes('add the') ||
        lowerMessage.includes('improve the') || lowerMessage.includes('better') || lowerMessage.includes('more professional')) {
      return {
        shouldGenerateCode: true,
        intent: 'code_request',
        confidence: 0.9
      };
    }

    // Cursor-like behavior: Short messages (under 50 chars) without clear code keywords
    if (message.length < 50) {
      // Check if it contains any code-related keywords
      if (this.codeKeywords.some(keyword => lowerMessage.includes(keyword))) {
        return {
          shouldGenerateCode: true,
          intent: 'code_request',
          confidence: 0.8,
          detectedLanguage,
          languagePreferences
        };
      }
      // Otherwise, it's conversational
      return {
        shouldGenerateCode: false,
        intent: 'general',
        confidence: 0.7,
        response: this.getGeneralResponse(message),
        detectedLanguage,
        languagePreferences
      };
    }

    // Cursor-like behavior: Medium length messages (50-150 chars) without clear keywords
    if (message.length < 150) {
      // Check if it contains any code-related keywords
      if (this.codeKeywords.some(keyword => lowerMessage.includes(keyword))) {
        return {
          shouldGenerateCode: true,
          intent: 'code_request',
          confidence: 0.8,
          detectedLanguage,
          languagePreferences
        };
      }
      

      
      // Otherwise, ask for clarification
      return {
        shouldGenerateCode: false,
        intent: 'clarification',
        confidence: 0.6,
        response: this.getClarificationResponse(message),
        detectedLanguage,
        languagePreferences
      };
    }

    // Cursor-like behavior: Long messages are usually code requests
    return {
      shouldGenerateCode: true,
      intent: 'code_request',
      confidence: 0.8,
      detectedLanguage,
      languagePreferences
    };
  }

  private static getGreetingResponse(message: string): string {
    const greetings = [
      "Hello! 👋 I'm here to help you with coding and development. What would you like to work on?",
      "Hi! I'm ready to help you build something amazing. What project do you have in mind?",
      "Hey there! What can I help you create today?",
      "Hello! I'm here to assist with your coding projects. What would you like to build?",
      "Hi! Ready to turn your ideas into code. What should we work on?"
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }

  private static getQuestionResponse(message: string): string {
    const responses = [
      "I'd be happy to help! Could you provide more details about what you're trying to accomplish?",
      "Great question! To help you better, could you give me more context about what you're working on?",
      "I'm here to help! Could you elaborate on your question so I can provide the most useful response?",
      "Interesting! Tell me more about what you're trying to achieve, and I'll guide you through it.",
      "I'd love to help with that! Could you provide some additional context about your project or goal?"
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  private static getCommandResponse(message: string): string {
    return "I understand you want to perform an action. Could you clarify what specific task you'd like me to help you with?";
  }

  private static getGeneralResponse(message: string): string {
    return "I'm here to help you with coding and development! Feel free to ask me to create applications, components, or help with any programming tasks.";
  }

  private static getHelpResponse(): string {
    return `I'm here to help! Here's what I can do for you:

🚀 **Code Generation**
• Create complete applications from scratch
• Build specific components and features
• Generate code for any programming language
• Create responsive websites and web apps

💡 **Development Assistance**
• Help with debugging and optimization
• Explain code concepts and best practices
• Suggest improvements and alternatives
• Answer questions about frameworks and libraries

⚙️ **Project Management**
• Manage files and project structure
• Run terminal commands
• Install packages and dependencies
• Deploy applications

🎯 **Examples of what you can ask:**
• "Create a React todo app"
• "Build a landing page for my business"
• "Help me debug this JavaScript error"
• "Explain how React hooks work"
• "Create an API with Node.js"

What would you like to work on?`;
  }

  private static getClarificationResponse(message: string): string {
    return "I see you have a request, but I want to make sure I understand correctly. Are you asking me to:\n\n1. Create or build something (code generation)\n2. Explain or help with something (conversation)\n3. Perform a specific action (command)\n\nPlease clarify so I can assist you better!";
  }
}
