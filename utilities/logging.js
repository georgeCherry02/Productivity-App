var allowed_logs = {
    error:          true,
    notice:         true,
    status_brief:   true,
    status_verbose: true,
    warn:           true
}

const divider = "##########################################################################################";

export class Logger {
    static log(log_type, message) {
        if (!allowed_logs[log_type.key]) {
            return;
        }
        if (log_type.multiline) {
            this.log_multiline(log_type, message);
        } else {
            if (typeof(message) === "object") {
                this.log_multiline(LoggingType.ERROR, ["Tried to print multi-line message using single line logging type!", "Occured using type:", log_type.key, "Initial message:"].concat(message))
                return;
            }
            this.log_notice(log_type, message);
        }
    }

    static log_multiline(type, message) {
        let use_dividers = (type == LoggingType.ERROR || type == LoggingType.WARN);
        if (use_dividers) {
            console.log(divider);
        }
        console.log(type.pretty);
        if (use_dividers) {
            console.log(divider);
        }
        for (var i = 0; i < message.length; i++) {
            console.log(message[i]);
        }
        if (use_dividers) {
            console.log(divider);
        }
    }

    static log_notice(type, message) {
        console.log(type.pretty + message)
    }
}

export const LoggingType = {
    ERROR: {
        key:        "error",
        multiline:  true,
        pretty:     "ERROR:"
    },
    NOTICE: {
        key:        "notice",
        multiline:  false,
        pretty:     "NOTICE: "
    },
    STATUS_BRIEF: {
        key:        "status_brief",
        multiline:  false,
        pretty:     "STATUS: "
    },
    STATUS_VERBOSE: {
        key:        "status_verbose",
        multiline:  true,
        pretty:     "STATUS:"
    },
    WARN: {
        key:        "warn",
        multiline:  true,
        pretty:     "WARN:"
    }
}