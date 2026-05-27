import Party from "../models/Party.js";
import Quest from "../models/Quest.js";

// create party (POST)
export const createParty = async (req, res) => {
    try {
        const { name, description, techStack } = req.body;

        // if user is already in a party
        if (req.user.currentParty) {
            return res.status(400).json({
                message: "You are already in a party"
            })
        }

        // check if user is partyMaster
        if (req.user.role !== "partyMaster") {
            return res.status(403).json({ message: "Only Party Masters can create parties" });
        }

        const party = await Party.create({
            name,
            description,
            techStack,
            partyMaster : req.user._id,
            apprentices: []
        })

        // update user's current party
        req.user.currentParty = party._id;
        await req.user.save();

        res.status(201).json(party);
    } catch (error) {
        res.status(500).json({
            message: "Failed to create party",
            error: error.message
        });
    }
    
}

// join party by id (POST)
export const joinParty = async (req, res) => {
    try {
        const party = await Party.findById(req.params.id);

        // party not found
        if (!party) {
            return res.status(404).json({ message: "Party not found" });
        }

        // if party is not 'forming', cannot join
        if (party.status !== "forming") {
            return res.status(400).json({
                message: "This party is not accepting members"
            });
        }

        // if user is already in a party
        if (req.user.currentParty) {
            return res.status(400).json({ message: "You are already in a party" });
        }

        // for security:
        // if party master tries to join another party
        if (party.partyMaster.toString() === req.user._id.toString()) {
            return res.status(400).json({
                message: "You cannot join your own party"
            });
        }
        // if apprentice tries to join the same party
        if (party.apprentices.some(id => id.toString() === req.user._id.toString())){
            return res.status(400).json({
                message: "You are already in this party"
            });
        }

        // limit to 2 apprentices
        if (party.apprentices.length >= 2) {
            return res.status(400).json({ message: "Party is full" });
        }

        party.apprentices.push(req.user._id);

        req.user.currentParty = party._id;
        await req.user.save();

        updatePartyStatus(party);

        console.log("Before save status:", party.status);
        console.log("Apprentices count:", party.apprentices.length);

        await party.save();

        // list party members
        const populatedParty = await Party.findById(party._id)
            .populate("partyMaster", "fullName email")
            .populate("apprentices", "fullName email");

        res.json({
            message: "Successfully joined party",
            party: populatedParty
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to join party",
            error: error.message
        });    
    }
}

// leave party (POST)
export const leaveParty = async (req, res) => {
    try {
        const party = await Party.findById(req.params.id);

        // party not found
        if (!party) {
            return res.status(404).json({ message: "Party not found" });
        }

        // if party master leaves
        if (party.partyMaster.toString() === req.user._id.toString()) {
            return res.status(400).json({ message: "Party master cannot leave the party" });
        }

        // if on quest
        if (party.status === 'on_quest') {
            return res.status(400).json({ message: "You cannot leave the party while quest is ongoing" });
        }

        // if not a part of the party
        if (!party.apprentices.some(id => id.toString() === req.user._id.toString())) {
            return res.status(400).json({
                message: "You are not a member of this party"
            });
        }

        // remove apprentice id to list
        party.apprentices = party.apprentices.filter(
            (id) => id.toString() !== req.user._id.toString()
        );

        updatePartyStatus(party);

        await party.save();

        req.user.currentParty = null;
        await req.user.save();

        res.json({
            message: "Successfully left the party",
            party
        })

    } catch (error) {
        res.status(500).json({
            message: "Failed to leave party",
            error: error.message
        }); 
    }
}

// list parties (GET)
export const listParties = async (req, res) => {
    try {
        const parties = await Party.find()
            .populate("partyMaster", "fullName email")
            .populate("apprentices", "fullName email")
            .sort({ createdAt: -1 });

        res.json(parties);

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch parties",
            error: error.message
        });
    }
};


// get party details by id (GET)
export const getPartyById = async (req, res) => {
    try {
        const party = await Party.findById(req.params.id)
            .populate("partyMaster", "fullName email level")
            .populate("apprentices", "fullName email level")
            .populate({
                path: "activeQuest",
                populate: {
                    path: "commissioner",
                    select: "fullName email"
                }
            });

        if (!party) {
            return res.status(404).json({ message: "Party not found" });
        }

        res.json(party);
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch party",
            error: error.message
        });
    }
};


// accept quest (POST)
export const acceptQuest = async (req, res) => {
    try {
        const { partyId, questId } = req.params;

        const party = await Party.findById(partyId);
        const quest = await Quest.findById(questId);

        if (!party) {
            return res.status(404).json({ message: "Party not found" });
        }

        if (!quest) {
            return res.status(404).json({ message: "Quest not found" });
        }

        // only party master can accept quest
        if (party.partyMaster.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                message: "Only the party master can accept a quest"
            });
        }

        // if apprentices is less than 2
        if (party.apprentices.length < 2) {
            return res.status(400).json({
                message: "Party must have 2 apprentices before accepting a quest"
            });
        }

        // if party not ready for quest
        if (party.status !== "ready_for_quest") {
            return res.status(400).json({
                message: "Party is not ready for a quest"
            });
        }

        // party already on quest
        if (party.status === "on_quest") {
            return res.status(400).json({
                message: "Party is already on a quest"
            });
        }

        // quest already taken
        if (quest.status !== "open") {
            return res.status(400).json({
                message: "Quest is not available"
            });
        }

        // update party
        party.activeQuest = quest._id;
        party.status = "on_quest";
        await party.save();

        // update quest
        quest.party = party._id;
        quest.status = "in_progress";
        await quest.save();

        res.json({
            message: "Quest accepted successfully",
            party,
            quest
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to accept quest",
            error: error.message
        });
    }
}

// helper func
function updatePartyStatus(party) {
    if (party.apprentices.length >= 2) {
        party.status = "ready_for_quest";
    } else {
        party.status = "forming";
    }
}
