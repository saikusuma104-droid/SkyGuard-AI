package skyguard.rule;

import java.util.ArrayList;
import java.util.List;

public class RuleResult {

    private boolean warning = false;
    private boolean critical = false;
    private List<String> flags = new ArrayList<>();
    private List<String> reasons = new ArrayList<>();

    public RuleResult() {}

    public void addFlag(String flag, String reason, boolean isCritical) {
        if (!this.flags.contains(flag)) {
            this.flags.add(flag);
        }
        if (reason != null && !reason.trim().isEmpty() && !this.reasons.contains(reason)) {
            this.reasons.add(reason);
        }
        if (isCritical) {
            this.critical = true;
        } else {
            this.warning = true;
        }
    }

    public boolean isWarning() {
        return warning;
    }

    public void setWarning(boolean warning) {
        this.warning = warning;
    }

    public boolean isCritical() {
        return critical;
    }

    public void setCritical(boolean critical) {
        this.critical = critical;
    }

    public List<String> getFlags() {
        return flags;
    }

    public void setFlags(List<String> flags) {
        this.flags = flags;
    }

    public List<String> getReasons() {
        return reasons;
    }

    public void setReasons(List<String> reasons) {
        this.reasons = reasons;
    }

    public boolean hasViolations() {
        return !flags.isEmpty();
    }
}
