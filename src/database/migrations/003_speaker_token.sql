-- The token the CLI generates when it hosts a talk: only websocket clients
-- carrying it may drive the talk. NULL for talks hosted by older CLIs, which
-- keep the open relay.
ALTER TABLE "HostedPresentation" ADD COLUMN "speakerToken" TEXT;
