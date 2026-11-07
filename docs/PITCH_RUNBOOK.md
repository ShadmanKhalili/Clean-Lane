# Pitch runbook

Use this on the day. It covers equipment, checklists, the 5-minute demo script,
fallbacks and investor Q&A.

> **Status note.** The big screen (`?pitch`), collector phone (`?drive=ROOM`) and
> audience phone (`?join=ROOM`) are still being built. Anything marked
> **(planned)** is what we intend to build. Confirm each one on rehearsal day
> before relying on it.

## Equipment

- [ ] Laptop, fully charged, with the charger
- [ ] HDMI and/or USB-C adapters for the venue projector (test both)
- [ ] Presenter phone (the collector phone), fully charged, with a charger
- [ ] Personal mobile hotspot, charged, with its Wi-Fi name and password written down
- [ ] Clean Lane deployed URL, bookmarked in the laptop browser
- [ ] Printed QR code for the join link, as a backup to the on-screen QR
- [ ] Spare battery pack for the presenter phone (optional)

## Checklists

### T-minus 1 day

- [ ] Open `https://<your-site>/?pitch` on the laptop. Confirm the **Live** badge (planned).
- [ ] Join from a phone on mobile data. Confirm the booking appears on the big screen.
- [ ] Check the Firebase console usage page for the project.
- [ ] Rehearse the full demo once, start to finish, with a timer.
- [ ] Print the QR code.

### T-minus 1 hour

- [ ] Plug the laptop into the projector. Set the display to mirror or extend, as needed.
- [ ] Open `/?pitch` on the projector. Confirm **Live** and that the map loads.
- [ ] Open the presenter phone on `?drive=ROOM` (the room code is shown on the big screen).
- [ ] Turn on the hotspot and check the laptop can reach the site over it.
- [ ] Clear any test bookings: press **R** to reset the room (planned).

### T-minus 10 minutes

- [ ] Press **D** on the big screen to show the collector-phone QR and join QR (planned).
- [ ] Scan the join QR with a colleague's phone. Confirm a pin drops.
- [ ] Do one full dry run with the colleague's phone as the audience:
      book, accept, weigh, verify, and check the points screen on their phone.
- [ ] Press **R** to reset the room. Confirm the map is empty.
- [ ] Rehearse the fallbacks below once, out loud.
- [ ] Close other apps and turn on Do Not Disturb on both phones.

## The 5-minute demo script

Times are from the start of your talk. Keep your lines short. Speak to the room,
not the screen.

### 0:00 Hook: the problem

**SAY:** "Dhaka's recyclables leak into canals and landfill. And when a brand says
its packaging was recycled, nobody can prove it."

**DO:** Show the big screen with the map. Keep it empty or nearly empty.

### 0:30 "Take out your phones"

**SAY:** "Scan this. You're a household in Dhaka. Book a pickup, and put your
first name on it."

**DO:** Point to the QR on screen. Let the audience scan and book. Each booking
drops a pin on the map with the name.

**Check:** Pins appear on the map within a few seconds. If they don't, see the
Wi-Fi fallback below.

### 1:30 The collector phone

**SAY:** "Here's a collector. I'll do the pickup."

**DO, in order, on the presenter phone:**

1. Accept one audience booking. The audience phone shows **Collector on the way**.
2. Enter a weight. The audience phone shows **Picked up & weighed**, the weight,
   and the equivalent in bottles (confirm the bottle figure on rehearsal day).
3. Verify at the hub. The audience phone shows **Verified at hub scale** and the points.
4. Let the audience see their points celebration.

**SAY:** "The household gets a booking, a collector, a weight and points. Each
step is recorded."

### 2:30 Fast-forward

**SAY:** "Let's see the rest of the day's pickups."

**DO:** Press **F** to fast-forward real bookings through verify, dispatch and
recycle (planned). Bags move from the hub to the recycler, and the totals tick up.

**SAY:** "Every bag is now traceable from the door to the recycler."

### 3:15 Verification

**DO:**

1. Press **V** to open the journey of the latest verified booking (planned).
   Alternatively, scan the verify link on a phone.
2. Walk through the stages: booked, collected, verified, dispatched, recycled.
3. Press **Simulate tampering** (planned). The chain breaks at the edited weight.

**SAY:** "This is what goes on the bottle. Each step is linked to the one before
it. Change one number and the chain breaks exactly where it changed."
**Then say:** "That's the product brands pay for: proof, not promises."

### 4:15 Close

**SAY:**

- "Here are the numbers on screen: [YOUR LIVE TOTALS]."
- "The model in one sentence: households earn points, collectors get steady work,
  and brands pay for verified recovery to meet their EPR obligations."
- "Today we're asking for [YOUR ASK]."

**DO:** Leave the totals on screen. Stop talking and take questions.

Placeholders you must fill in before the day:

- [YOUR ASK]
- [YOUR LIVE TOTALS] (the numbers the screen shows)
- [STAT: market size, source needed]
- [STAT: recycling rate, source needed]

Do not add a market figure you cannot cite.

## Fallbacks

Use the first one that fits. Practise each one once.

| Problem | What to do |
| --- | --- |
| **Venue Wi-Fi fails** | Switch the laptop to the personal hotspot. Reload `/?pitch`. Confirm **Live**. |
| **Firebase unreachable** | Press **B** to turn on offline backup (planned). Press **S** to start the simulated audience (planned). Say: "Let me show you a simulated room." Note: offline backup only syncs tabs in one browser on one device, so audience phones cannot join. |
| **Projector fails** | Run the collector and verify flow on the presenter phone. Hand the phone around the room. Narrate what each person sees. |
| **Nobody joins** | Press **S** to start the simulated audience (planned). Say: "The room is filling up. Here's what it looks like." |

After a fallback, press **R** to reset the room before you resume real bookings.

## Presenter shortcuts (planned: confirm on rehearsal day)

These shortcuts are planned. They may change before the event.

| Key | Action |
| --- | --- |
| **S** | Toggle the audience simulator |
| **B** | Toggle offline backup |
| **F** | Fast-forward real bookings through verify, dispatch and recycle |
| **D** | Show the collector-phone QR and link |
| **V** | Open the journey of the latest verified booking |
| **N** | New room |
| **R** | Reset room (removes all bookings in the room) |
| **Enter** | Fullscreen |
| **Esc** | Close overlays |
| **?** | Help |

## After the pitch

- [ ] Press **R** to reset the room. This removes the demo bookings.
- [ ] If you are finished with the live demo, lock the database rules (see
      `docs/FIREBASE_SETUP.md`, section 9).
- [ ] Note what worked and what failed while it is fresh.

## Q&A prep

Be honest about what is real and what is simulated. Investors trust the demo more
when you say which parts are which.

**Is this live data?**
Audience bookings are live: they sync across phones in the room through Firebase.
The collector steps are performed by the presenter. The hub and recycler steps
are demo steps. Simulated bookings are flagged in the data. In the demo, the hub
weight is calculated as 97% of the doorstep weight unless someone enters a value.

**Is the hash chain a blockchain?**
No. It is a hash chain: each record includes a fingerprint of the record before
it. If anyone edits a past record, the chain no longer checks out. It proves the
records were not changed after the fact. It does not prove the original entry was
true. Trust in the original entry comes from who recorded it and how.

**What stops someone from editing the records?**
Today, the chain makes edits visible, and the database rules limit what can be
written and where. In the demo, anyone with the room code can write to that room.
A production system would need real sign-in, server-side writes and signed records
from the scale and the collector devices.

**How is the weight measured?**
Doorstep weight comes from a portable scale, as the demo shows. Hub weight is
meant to come from a certified scale. The demo estimates it, so do not present
the demo's hub weight as a measured figure. [YOUR CALIBRATION PLAN, if any]

**What is real today and what is roadmap?**
Real today: the map, the audience booking flow, live sync across phones, the
journey record and the tamper check. Demo only: the collector and hub steps,
the recycler, and the simulated households. Roadmap: [YOUR ROADMAP].

**How do households and collectors get paid?**
[YOUR ANSWER: points redemption, payment rails, collector pay rates.] Do not
guess. Say you will follow up with the detail.

**Who pays, and why?**
Brands pay for verified recovery so they can meet their EPR obligations. [YOUR
PRICING AND FIRST CUSTOMER DETAILS.] If a brand has not agreed to pay, say so.

**What personal data does the demo collect?**
The audience enters a first name, an area and the materials. There is no login.
Bookings are removed when the room is reset. [YOUR PRODUCTION PRIVACY PLAN.]
