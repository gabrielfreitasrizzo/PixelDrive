interface AlertBannerProps {
    type: "error" | "success";
    message: string;
}

export function AlertBanner({ type, message }: AlertBannerProps) {
    return (
        <div className={`alert ${type === "error" ? "alert-error" : "alert-success"}`}>
            {message}
        </div>
    );
}