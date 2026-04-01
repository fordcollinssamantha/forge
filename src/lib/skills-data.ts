export interface LessonSections {
  move: string;
  tell: string;
  pivot: string;
  exitGood: string;
  exitTough: string;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  sections: LessonSections;
}

export interface SkillModule {
  id: string;
  title: string;
  difficulty: "starter" | "intermediate" | "advanced";
  icon: string;
  lessons: Lesson[];
}

export const DIFFICULTY_LABELS: Record<string, string> = {
  starter: "Starter",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

export const DIFFICULTY_DESCRIPTIONS: Record<string, string> = {
  starter: "Solo actions, low social risk",
  intermediate: "Initiating with one person",
  advanced: "Group dynamics & awkward moments",
};

export const SKILL_MODULES: SkillModule[] = [
  {
    id: "starting-conversations",
    title: "Starting Conversations",
    difficulty: "intermediate",
    icon: "\u{1F4AC}",
    lessons: [
      {
        id: "at-the-gym",
        title: "At the Gym",
        description: "How to talk to someone between sets without being annoying.",
        sections: {
          move: `Wait for a natural break — between sets, filling a water bottle, wiping down equipment. Say "Hey, how many sets you got left?" or "Mind if I work in?" Equipment sharing is the gym's built-in conversation starter. Don't approach someone mid-set with headphones in.`,
          tell: `If they take an earbud out and give you more than a one-word answer, they're open. If they answer "two" and put the earbud back in, they're in the zone — respect it. The guys standing around between sets looking at their phone are more available than the ones grinding through a program.`,
          pivot: `If you got a short answer but want to keep it going, comment on something specific: "Is that the 5/3/1 program?" or "Those shoes good for squatting?" Gear and programming talk is safe territory. Don't give unsolicited form advice — that's a different conversation and nobody asked.`,
          exitGood: `"I'll let you get back to it. I'm here most mornings if you ever need a spot." Low commitment, leaves the door open, gives them a reason to recognize you next time.`,
          exitTough: `"All good, thanks man" and put your headphones back in. The gym has a built-in exit: just go do another exercise.`,
        },
      },
      {
        id: "at-a-rec-league",
        title: "At a Rec League or Pickup Game",
        description: "The easiest social cheat code most people overlook.",
        sections: {
          move: `Walk up to the group and say "You guys need one?" or "You need a fifth?" Don't overthink it. The sport is the excuse — you're not asking to be friends, you're asking to fill a spot.`,
          tell: `If they wave you over or say "yeah, come on" — you're in. If they say "we're good" but they're smiling, hang nearby and they'll probably grab you next game. If they don't look up at all, find a different court or shoot around until the next run.`,
          pivot: `If you're in the game and nobody's talking to you, call out picks and switches. Game communication is social currency in pickup. You don't need to be good — you need to be vocal. "I got ball" or "switch, switch" does more than any small talk.`,
          exitGood: `After the game: "Good run. You guys out here Saturdays?" That's it. You just made a reason to come back. Fist bump, grab your water, leave.`,
          exitTough: `If the vibe is off or the group is cliquey: "Appreciate the run" and walk. No explanation needed. You showed up, you played, you're done.`,
        },
      },
      {
        id: "at-a-work-event",
        title: "At a Work Event",
        description: "Navigating happy hours and offsites without clinging to your team.",
        sections: {
          move: `Find someone else who looks like they just got there. Walk up and say "I don't think we've met — I'm [name], I'm on the [team] side." The new-arrival window is your best opening because everyone is doing the same scan-and-approach calculation.`,
          tell: `If they put their phone away and angle toward you, you're in a conversation. If they're scanning the room over your shoulder or giving one-word answers, they're looking for someone else. That's not rejection — they're just in a different mode.`,
          pivot: `If the conversation hits a dead spot, pivot to something observable: "Have you been to this place before?" or "Did you come straight from the office?" Don't ask "what do you do" — at a work event, that's boring because the answer is obvious. Ask about something outside work: "Do anything good this weekend?"`,
          exitGood: `"I'm gonna go grab another drink, but it was good to meet you. I'll find you on Slack." Specific follow-up > vague promise.`,
          exitTough: `"Excuse me, I see someone I need to catch real quick." Nobody questions this at a work event. You're free.`,
        },
      },
      {
        id: "at-a-friend-of-friend-hangout",
        title: "At a Friend-of-Friend Hangout",
        description: "How to slot into a new group when you only know one person.",
        sections: {
          move: `Walk up to someone and say "Hey, how do you know [host's name]?" That one question can carry a whole conversation because everyone has a story. You already have a stamp of approval — you're someone's friend.`,
          tell: `If they turn toward you and start telling their story, you're in. If they give a one-liner — "college" — and look back at their group, they're not available right now. Look for the other person who also seems like they don't know everyone. They're your best bet.`,
          pivot: `If the "how do you know them" thread dies, try "Is this crew usually this fun or did I get lucky?" It's a compliment to the group that also invites an opinion. People like giving opinions.`,
          exitGood: `"I'm gonna go find [host] and say what's up, but good talking to you. I'm sure I'll see you at the next one." Ties it off and implies you're part of the circle now.`,
          exitTough: `"I'm gonna go grab a drink, good to meet you." Walk toward the kitchen or the bar. At a house party, the kitchen is always a safe reset point.`,
        },
      },
      {
        id: "at-a-bar-or-restaurant",
        title: "At a Bar or Restaurant",
        description: "Starting conversations in louder, more casual settings.",
        sections: {
          move: `If you're at the bar or counter waiting, say "Have you been here before — is the [food/drink] actually good or is it just the vibe?" You're asking for a recommendation, which is easy to answer and doesn't feel loaded. At a sports bar, react to what's on the screen: "Did you see that? That was clearly a foul."`,
          tell: `If they lean in to answer or ask what you're thinking of ordering, they're open. If they give a quick "yeah it's good" and turn back to their group or phone, they're not looking to chat. People sitting solo at the bar or communal tables are almost always more available than people in booths.`,
          pivot: `If your opener lands but the conversation stalls, comment on the environment: "This place is way busier than I expected" or "You know what's good on the menu?" Shared surroundings are infinite conversation fuel in bars and restaurants.`,
          exitGood: `"Enjoy the rest of your night, man. If you're ever here on a [day], I'm usually around." Casual, no pressure, leaves the door cracked.`,
          exitTough: `"Alright, I'm gonna close out. Good talking to you." Signal the bartender and you've got a built-in reason to disengage.`,
        },
      },
    ],
  },
  {
    id: "reading-the-room",
    title: "Reading the Room",
    difficulty: "intermediate",
    icon: "\u{1F440}",
    lessons: [
      {
        id: "when-to-approach",
        title: "When to Approach Someone",
        description: "The green lights that mean someone's open to talking.",
        sections: {
          move: `Look for someone who just arrived and is scanning the room, or someone standing on the edge of a group rather than locked in a tight circle. Walk toward them within 10 seconds of deciding — waiting longer just builds anxiety. A simple "Hey, I'm [name]" is enough.`,
          tell: `Green lights: eye contact that lasts more than a second (especially if they look away then look back), open body language with arms uncrossed, or someone who makes a comment to no one in particular about the music, the line, the food. That last one is an open invitation — respond to it.`,
          pivot: `If you misread the signal and they give you a short answer, don't retreat awkwardly. Just treat it as a micro-interaction: "Cool, enjoy your night" with a nod. You didn't fail — you just got data. Move to the next person.`,
          exitGood: `If the signal was right and you had a good exchange: "Good talking to you — I'm gonna keep making the rounds." You leave as someone social, not someone who latches on.`,
          exitTough: `If you approached and it's clearly not landing: a quick "Anyway, have a good one" and walk with purpose toward the bar or food. Don't slink away — just redirect.`,
        },
      },
      {
        id: "when-to-hold-back",
        title: "When to Hold Back",
        description: "Reading the red flags that say 'not right now.'",
        sections: {
          move: `Before approaching, do a 3-second scan. Check for headphones in, body turned away, locked-in focus on a screen or task, or visible agitation. If you see any of these, don't approach — find someone else. The room is full of people; pick the ones who are actually available.`,
          tell: `Red lights: one-word answers with no eye contact, checking their phone while you're talking, body angled away from you, and the biggest one — they start giving shorter answers than they were giving 30 seconds ago. That's someone closing the door in real time.`,
          pivot: `If you're already in a conversation and realize they've closed off, don't try harder. That makes it worse. Acknowledge the shift by wrapping up naturally: "Anyway, I'll let you get back to it." You're reading the room correctly — act on it.`,
          exitGood: `Not applicable here — this card is about knowing when NOT to approach. The best move is the approach you didn't make. Save your energy for someone who's actually open.`,
          exitTough: `If you already approached and it's cold: "Good to meet you" with a nod and walk away clean. Don't take it personally — they might be having a terrible day. It's almost never about you.`,
        },
      },
      {
        id: "group-dynamics-reading",
        title: "Reading Group Dynamics",
        description: "Who's open, who's closed off, and where you fit in.",
        sections: {
          move: `Look at the shape of the group. An open group has a gap in their circle — they're physically leaving space for someone to join. A closed group is a tight ring with everyone facing inward. Walk toward the open ones. Find the listeners, not the talkers — they're more likely to welcome you in.`,
          tell: `The listeners are nodding along but glancing around the room. The talker has everyone's attention locked in. A group laughing loudly is in a good mood but hard to break into mid-story. A group in a quiet lull is your best opening — they're ready for new energy.`,
          pivot: `If you misjudged and walked up to a closed group, don't stand on the edge hoping someone notices you. Either say "Mind if I join?" within 10 seconds, or redirect to a different group. Hovering is the worst of both worlds.`,
          exitGood: `Once you've read the group right and joined: "Good meeting you all" with a wave to the group. You came in clean and you leave clean. People remember that.`,
          exitTough: `If you joined and it's still closed off — they keep turning inward and not including you: "I'll let you guys catch up" and walk. No hard feelings, you just picked the wrong cluster.`,
        },
      },
      {
        id: "one-on-one-signals",
        title: "One-on-One Signals",
        description: "When someone wants to keep talking vs. wrap up.",
        sections: {
          move: `Pay attention to what they do, not just what they say. Watch their body, their eyes, and their questions. If they're asking you follow-up questions and their body is squared up facing you, keep going. If answers are getting shorter and they're glancing around, start wrapping.`,
          tell: `"Keep talking" signals: they say "Oh wait, that reminds me of..." or they share something personal. "Wrap it up" signals: answers get shorter, they stop asking questions back, they shift their weight toward the exit, or they start summarizing with "Well, anyway..." or "So yeah..."`,
          pivot: `If you catch wrap-up signals but want to leave on a high note, don't try to revive the conversation. Instead, close with something memorable: reference a specific thing they said, or suggest something concrete for next time. You're converting a fading conversation into a future connection.`,
          exitGood: `"Hey, I could keep talking but I don't want to hold you up. Let's pick this up next time." Ending a good conversation at the right time makes them want to talk to you again. Overstaying kills that.`,
          exitTough: `"Good talking to you, man." That's it. Don't over-explain, don't apologize for taking their time. A clean three-second exit is always better than a rambling thirty-second one.`,
        },
      },
    ],
  },
  {
    id: "following-up",
    title: "Following Up",
    difficulty: "intermediate",
    icon: "\u{1F4F2}",
    lessons: [
      {
        id: "after-first-meeting",
        title: "After Meeting Someone",
        description: "The 48-hour window and what to actually say.",
        sections: {
          move: `Text within 48 hours. Reference something specific from your conversation: "Hey, it's [name] from the game night Tuesday. That Catan betrayal was cold-blooded. You coming next week?" Short, specific, gives them something to respond to. You're not writing a cover letter.`,
          tell: `If they reply with more than a few words and ask a question back, the door is open. If they hit you with a "haha yeah" and nothing else, they're being polite but not interested in continuing. One more try is fine; two unanswered follow-ups means move on.`,
          pivot: `If your first text gets a lukewarm reply, don't send another text — send a specific invite. "A few of us are doing [activity] on Saturday, you in?" An event invite is easier to say yes to than an open-ended conversation. It gives them a reason and a time.`,
          exitGood: `If the exchange is going well: "Cool, I'll hit you up Saturday with the details." Now you have a concrete next step and a reason to text again without it being random.`,
          exitTough: `If they don't respond or give you nothing to work with: let it go. Don't send a "did you get my text?" follow-up. Some connections just don't stick, and that's fine. You'll meet other people.`,
        },
      },
      {
        id: "after-group-event",
        title: "After a Group Event",
        description: "Following up when you met multiple people at once.",
        sections: {
          move: `If there's a group chat, Discord, or Slack, post something after the event: "Good time last night. Anyone down to run it back next weekend?" You're not singling anyone out — you're being the person who keeps the momentum going. That's high-value social behavior.`,
          tell: `If people react or reply with "I'm down" or "let's do it," you've got a crew forming. If your message sits with no replies, the group energy wasn't as strong as it felt in the moment. Try reaching out to the one or two people you actually clicked with directly instead.`,
          pivot: `If you don't have group access, go through your mutual connection: "Hey, Marcus from last night was cool — can you drop me his number?" This is completely normal. Or DM someone directly on Instagram: "Yo, good times at [event]. That story about your roommate had me dead."`,
          exitGood: `Once the next hangout is locked in: "Bet. I'll send the details Thursday." You're the organizer now — that's a social role people respect and remember.`,
          exitTough: `If nobody bites on the group follow-up, don't take it personally and don't keep pushing. Some groups are one-night energy. Focus on the individual connections that actually had spark.`,
        },
      },
      {
        id: "restarting-a-friendship",
        title: "Restarting a Friendship",
        description: "Reaching out to someone you haven't talked to in months.",
        sections: {
          move: `Send something like: "Hey man, just saw [specific thing] and thought of you. How've you been?" Or more direct: "Yo, I know it's been a minute. What are you up to these days?" Acknowledge the gap without making it a big deal. Don't apologize for four paragraphs.`,
          tell: `If they match your energy — "Bro it's been forever, I'm good! What about you?" — you're back. If they reply but keep it surface-level, they might need a concrete reason to re-engage. If they don't respond at all, wait a month and try once more with a specific invite.`,
          pivot: `If the catch-up chat stalls, attach a specific plan: "A few of us do board game night on Thursdays — you should come through" or "I started going to this pickup game on Saturdays, you in?" A concrete invite is ten times better than "we should hang out sometime."`,
          exitGood: `"Good catching up, man. I'll text you the details for Saturday." You've closed the gap and created a next step. The friendship has momentum again.`,
          exitTough: `If they're clearly not interested in reconnecting, don't force it. "Good to hear you're doing well, man. Hit me up if you're ever free." Leave the door open and walk through it yourself.`,
        },
      },
      {
        id: "the-second-hang",
        title: "The Second Hang",
        description: "Making it happen without being weird about it.",
        sections: {
          move: `Text within a few days of the first hang. Keep it activity-based and low-key: "Hey, I'm hitting the gym Saturday morning if you want to come through" or "Some of us are playing Smash at my place Sunday — you in?" Activity-based invites work because there's no pressure to perform friendship.`,
          tell: `If they say yes or counter with "Can't Saturday but how about Sunday?" — they're interested. If they say "maybe" with no follow-up or reschedule three times, they're being polite but it's not happening. Two invites is enough to know.`,
          pivot: `If a direct invite feels too forward, use a group setting as cover: "A few people are going to [thing], you should come." Lower stakes, easier yes. Once they're there, the one-on-one connection happens naturally inside the group.`,
          exitGood: `After the second hang goes well: "That was solid, let's make it a regular thing." You just went from acquaintance to recurring plans. That's how friendships actually form.`,
          exitTough: `If the second hang doesn't happen after two tries: stop initiating. You're not being rejected — some people aren't in a season for new friendships. Put your energy toward the people who are showing up.`,
        },
      },
    ],
  },
  {
    id: "group-dynamics",
    title: "Group Dynamics",
    difficulty: "advanced",
    icon: "\u{1F465}",
    lessons: [
      {
        id: "joining-a-group",
        title: "Joining a Group Already Talking",
        description: "How to walk up to a circle of people without it being awkward.",
        sections: {
          move: `Walk up with purpose — don't hover. Stand at the edge where there's a natural gap, make eye contact with one person, and wait for a pause. When it comes, say: "Mind if I jump in? I'm [name]" or "Room for one more?" Commit within 10 seconds of arriving.`,
          tell: `If someone shifts to make space and includes you with eye contact or a nod, you're in. If the circle tightens and no one acknowledges you after your opener, they're in a private conversation. That's information, not rejection.`,
          pivot: `If you're in but struggling to find your footing, don't try to steer the conversation. React to what's being said — a laugh, a "no way," a quick "that happened to me too." Small reactions keep you in the flow without forcing a spotlight moment.`,
          exitGood: `"Good meeting you all — I'm gonna go make the rounds." You entered with confidence and left with the same energy. People remember the person who came and went smoothly.`,
          exitTough: `If the group never really opened up: "I'll let you guys catch up" and walk toward someone else or the bar. No lingering, no awkward fade-out. You tried, it wasn't the right group, next.`,
        },
      },
      {
        id: "contributing-not-dominating",
        title: "Contributing Without Dominating",
        description: "Adding to a group conversation without taking it over.",
        sections: {
          move: `Think rhythm section, not lead solo. Your best contributions are short reactions, good questions, and building on what someone else said. If someone tells a story, say "That happened to me too — the driver missed every turn." You're adding, not redirecting.`,
          tell: `Watch the ratio. If you've talked three times in a row, pull back. If people are looking at you waiting for a reaction but not asking questions, you might be dominating. If they're building on what you said and keeping the thread going, you're in the sweet spot.`,
          pivot: `If you realize you've been talking too much, ask a question to pass the spotlight: "Wait, how'd that end up?" or "What about you — you ever deal with that?" Redirecting to someone else resets the balance without making it obvious you noticed.`,
          exitGood: `When the conversation is flowing well and your contributions are landing: leave on a high note. "Alright, I need to go grab a drink — but that story about the Uber was incredible." Exit after your best moment, not after a lull.`,
          exitTough: `If you dominated and the energy shifted: "Anyway, I've been talking too much — what were you saying about [their topic]?" Acknowledging it briefly and handing the floor back earns more respect than pretending it didn't happen.`,
        },
      },
      {
        id: "handling-awkward-silences",
        title: "Handling Awkward Silences",
        description: "What to actually do when a group conversation dies.",
        sections: {
          move: `You have three plays. The redirect: "So what's everyone doing this weekend?" The observation: "Is it just me or is this playlist actually fire?" The callback: "Wait, you never finished that story about your roommate's dog." Pick one and deliver it calmly — don't rush.`,
          tell: `What feels like 30 seconds of silence is usually about 4 seconds. If people are looking at their drinks but still standing there, they're waiting for a new thread — not trying to leave. If they start physically dispersing, the conversation is actually over, and that's fine.`,
          pivot: `If your silence-breaker lands flat, don't panic and fire off another one. Let the beat breathe. Someone else will usually jump in within a few seconds. It's not your sole responsibility to fill every gap — you just need to be willing to fill one.`,
          exitGood: `If the silence is a natural endpoint: "Alright, I'm gonna go check out [something]. Good talking to you all." A silence is a perfectly fine exit ramp — use it as one instead of fighting it.`,
          exitTough: `If you tried to restart the conversation and it's clearly done: "Well, I'm gonna grab another drink. Catch you guys later." No need to make the silence worse by calling attention to it. Just move.`,
        },
      },
      {
        id: "leaving-gracefully",
        title: "Leaving a Conversation Gracefully",
        description: "How to exit without ghosting or making it weird.",
        sections: {
          move: `Give a short reason and end on a positive note. "Hey, I'm gonna go grab a drink — good talking to you guys." Or: "I told my buddy I'd find him — catch you later." The reason doesn't have to be real, it just has to be brief.`,
          tell: `The right time to leave is when the conversation is still good — not when it's dying. If you leave during a high point, they remember the good energy. If you leave during a lull, they remember the awkwardness. Watch for a natural laugh or agreement moment and exit right after.`,
          pivot: `If you missed the good exit moment and now it's fading, use a practical excuse: "I should go say hi to a few more people" or "I need to close out my tab." Practical exits never feel rude because everyone understands them.`,
          exitGood: `End with a specific detail: "Good luck with that interview next week" or "Let me know how that project turns out." Remembering something they mentioned shows you were listening. That's what makes them want to talk to you again.`,
          exitTough: `If you need to leave a conversation that's going nowhere: "Alright, I'm gonna make the rounds. Good to meet you." Five seconds, no explanation, no apology. Clean and done.`,
        },
      },
      {
        id: "being-the-connector",
        title: "Being the Connector",
        description: "Introducing people to each other — the highest-value social move.",
        sections: {
          move: `The formula is simple: "[Name], this is [Name] — you both [shared thing]." Example: "Marcus, this is Dev — you're both into producing beats." You're giving them a conversation starter so they skip the awkward small talk. You don't need to know either person well — just one overlapping detail.`,
          tell: `If they turn toward each other and start talking, your intro landed. Stay for 30 seconds to make sure the conversation gets going, then you can step away. If one of them keeps looking at you instead of the other person, the connection didn't click — that's fine, not every intro works.`,
          pivot: `If the intro falls flat, add more context: "Dev was telling me earlier about that beat he made for the short film — Marcus, didn't you just finish editing something?" Give them a second thread to grab onto. Two connection points is better than one.`,
          exitGood: `Once they're talking to each other: "I'll let you two chop it up" and step away. Do this two or three times at an event and people start coming to you. You become the hub without trying.`,
          exitTough: `If neither person engages: "Anyway, good to see you both" and redirect. Don't force two people to have a conversation they don't want. Some intros just don't hit — move on to the next one.`,
        },
      },
    ],
  },
  {
    id: "going-solo",
    title: "Going Solo",
    difficulty: "starter",
    icon: "\u{1F3AF}",
    lessons: [
      {
        id: "showing-up-alone",
        title: "Showing Up Alone",
        description: "How to walk in by yourself and actually own it.",
        sections: {
          move: `Walk in and go straight to the bar, the food table, or the sign-in area. Get a drink or grab a plate. Now you have something in your hands and a reason to be standing where you're standing. You're not "the person standing alone" — you're "the person getting a drink."`,
          tell: `If people near you are making eye contact or glancing your way, they're open. If you notice another solo person doing the same scan-and-settle routine you just did, that's your person — they want someone to break the ice as much as you do.`,
          pivot: `If the first spot you pick feels dead, move. Walk to where the energy is — the kitchen at a house party, the snack table at a meetup, the bar between sets at a show. Position yourself where people naturally gather and the conversation comes to you.`,
          exitGood: `After you've had at least one conversation: "Alright, I'm heading out — glad I came through." You showed up solo, you talked to people, you left on your terms. That's a win.`,
          exitTough: `If it's just not clicking tonight: leave without guilt. "Had a good time, gotta head out." Not every event is your event. The fact that you showed up alone already took more guts than most people have. Come back next time.`,
        },
      },
      {
        id: "when-you-dont-know-anyone",
        title: "When You Don't Know Anyone",
        description: "What to do when you're the only stranger in the room.",
        sections: {
          move: `Find the host or organizer — they're the one person whose job is to make you feel welcome. Say: "Hey, first time here — I'm [name]. How does this usually work?" They'll either explain the setup or introduce you to someone. Either way, you're in.`,
          tell: `If the host introduces you to someone and that person sticks around to chat, you've got your foothold. If everyone seems locked into existing conversations, look for the other new person — they're doing the same wall-lean-and-scan you were. Walk up: "First time? Me too."`,
          pivot: `If the host is busy and nobody's breaking off, find the activity. At a board game night, grab a game. At a rec league, start warming up. At a meetup, sit down at a table with open seats. Activities are the universal ice-breaker because they give you a role without requiring a social opener.`,
          exitGood: `"This was cool — I'll definitely come back next week." Telling the host or organizer you're coming back does two things: it commits you to return, and it gives them a reason to recognize you next time.`,
          exitTough: `If you spent the whole time on the edges and couldn't break in: leave, but come back. Second visits are always easier because you're no longer the brand-new person. "See you next time" to anyone within earshot, and walk out.`,
        },
      },
      {
        id: "the-first-5-minutes",
        title: "The First 5 Minutes",
        description: "What to do with your hands, where to stand, how to look approachable.",
        sections: {
          move: `Hands: hold a drink or put one hand in your pocket — just don't cross your arms. Where to stand: near the entrance or the bar where new people arrive, not in the back corner. How to look approachable: chin up, slight smile, look around the room instead of at the floor. Keep your phone in your pocket for the first 10 minutes.`,
          tell: `If someone near you makes eye contact and holds it for a beat, that's your green light — say hi. If people are flowing around you but no one's stopping, you might be in a dead zone. Move to a higher-traffic spot: the food, the communal table, the area near the activity.`,
          pivot: `If 5 minutes pass and you haven't talked to anyone, give yourself a task: get a refill, check out the game shelf, look at the menu. Movement resets your energy and puts you in new proximity to new people. Standing still and waiting for someone to approach you almost never works.`,
          exitGood: `You don't need to exit after 5 minutes — this is about getting through the hardest part. Once you've had one exchange, even a small one, you've broken the seal. Everything after that is easier.`,
          exitTough: `If 5 minutes in you're already thinking about leaving: stay 10 more. The anxiety peak is always at the start. If you still feel off after 15 minutes total, leave — but most of the time, the worst is already behind you.`,
        },
      },
    ],
  },
];

export function getModule(moduleId: string): SkillModule | undefined {
  return SKILL_MODULES.find((m) => m.id === moduleId);
}

export function getLesson(
  moduleId: string,
  lessonId: string
): { module: SkillModule; lesson: Lesson; lessonIndex: number } | undefined {
  const module = getModule(moduleId);
  if (!module) return undefined;
  const lessonIndex = module.lessons.findIndex((l) => l.id === lessonId);
  if (lessonIndex === -1) return undefined;
  return { module, lesson: module.lessons[lessonIndex], lessonIndex };
}
