interface ArrivalMessage {
  finalMessage: string;
  status: "arrival" | "departure" | "error";
}

export const mapArrivalMessageForWorker = (passedMessage: string): ArrivalMessage => {
  console.log("Passed message: ", passedMessage);
  switch (passedMessage) {
    case "Worker is not part of this department":
      return { finalMessage: "Niste dio ovog odjela", status: "error" };
    case "Work shift is not in progress":
      return { finalMessage: "Smjena nije u toku", status: "error" };
    case "Invalid code":
      return { finalMessage: "Korišten zastarijeli kod", status: "error" };
    case "Worker has arrived at class session":
      return { finalMessage: "Prijavljeni ste na smjenu", status: "arrival" };
    case "Worker has departed from class session":
      return { finalMessage: "Odjavljen ste sa smjene", status: "departure" };
    case "Worker already attended this class shift":
      return { finalMessage: "Već ste se prijavili i odjavili sa smjene", status: "error" };
    default:
      return { finalMessage: "Greška", status: "error" };
  }
};