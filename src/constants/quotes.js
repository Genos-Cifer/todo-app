// Quotes shown on the login page — one picked at random per page load.
// Kept as a local list rather than fetched from a quotes API on purpose: the
// login page is the worst place to depend on a flaky third party, and a local
// list still gives a fresh quote every visit with zero latency or failure mode.
export const QUOTES = [
  { text: "What gets measured gets managed.", author: "Peter Drucker" },
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "You don't have to see the whole staircase, just take the first step.", author: "Martin Luther King Jr." },
  { text: "Until we can manage time, we can manage nothing else.", author: "Peter Drucker" },
  { text: "Amateurs sit and wait for inspiration. The rest of us just get up and go to work.", author: "Stephen King" },
  { text: "Your mind is for having ideas, not holding them.", author: "David Allen" },
  { text: "It's not always that we need to do more but rather that we need to focus on less.", author: "Nathan W. Morris" },
  { text: "Action is the foundational key to all success.", author: "Pablo Picasso" },
  { text: "Do the hard jobs first. The easy jobs will take care of themselves.", author: "Dale Carnegie" },
  { text: "The way to get started is to quit talking and begin doing.", author: "Walt Disney" },
  { text: "Ordinary people think merely of spending time. Great people think of using it.", author: "Arthur Schopenhauer" },
  { text: "Focus on being productive instead of busy.", author: "Tim Ferriss" },
  { text: "You may delay, but time will not.", author: "Benjamin Franklin" },
  { text: "Simplicity boils down to two steps: identify the essential, eliminate the rest.", author: "Leo Babauta" },
  { text: "Either you run the day or the day runs you.", author: "Jim Rohn" },
  { text: "Start where you are. Use what you have. Do what you can.", author: "Arthur Ashe" },
  { text: "The bad news is time flies. The good news is you're the pilot.", author: "Michael Altshuler" },
  { text: "A goal without a plan is just a wish.", author: "Antoine de Saint-Exupéry" },
  { text: "Done is better than perfect.", author: "Sheryl Sandberg" },
  { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
  { text: "Motivation is what gets you started. Habit is what keeps you going.", author: "Jim Ryun" },
  { text: "The key is not to prioritize what's on your schedule, but to schedule your priorities.", author: "Stephen Covey" },
  { text: "Small deeds done are better than great deeds planned.", author: "Peter Marshall" },
  { text: "Lost time is never found again.", author: "Benjamin Franklin" },
  { text: "Nothing is particularly hard if you divide it into small jobs.", author: "Henry Ford" },
  { text: "Concentrate all your thoughts upon the work at hand.", author: "Alexander Graham Bell" },
  { text: "Success is the sum of small efforts repeated day in and day out.", author: "Robert Collier" },
  { text: "The most effective way to do it, is to do it.", author: "Amelia Earhart" },
  { text: "Absorb what is useful, discard what is not, add what is uniquely your own.", author: "Bruce Lee" },
  { text: "How we spend our days is, of course, how we spend our lives.", author: "Annie Dillard" },
  { text: "Discipline is choosing between what you want now and what you want most.", author: "Abraham Lincoln" },
  { text: "If you spend too long thinking about a thing, you'll never get it done.", author: "Bruce Lee" },
  { text: "There is nothing so useless as doing efficiently that which should not be done at all.", author: "Peter Drucker" },
  { text: "You can do anything, but not everything.", author: "David Allen" },
  { text: "Well done is better than well said.", author: "Benjamin Franklin" },
  { text: "Efficiency is doing things right; effectiveness is doing the right things.", author: "Peter Drucker" },
  { text: "Do something today that your future self will thank you for.", author: "Sean Patrick Flanery" },
  { text: "The shorter way to do many things is to only do one thing at a time.", author: "Mozart" },
  { text: "Progress, not perfection, is what we should be asking of ourselves.", author: "Julia Cameron" },
  { text: "Tomorrow is often the busiest day of the week.", author: "Spanish Proverb" },
];

export function getRandomQuote() {
  return QUOTES[Math.floor(Math.random() * QUOTES.length)];
}
