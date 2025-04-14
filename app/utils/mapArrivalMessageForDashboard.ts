// Besides the string also return one of three: "arrival", "departure" or "error".

interface ArrivalMessage {
  finalMessage: string;
  status: "arrival" | "departure" | "error";
}

export const mapArrivalMessageForDashboard = (passedMessage: string, firstName: string, lastName: string): ArrivalMessage => {
  console.log("Passed message: ", passedMessage);
  switch (passedMessage) {
    case "Worker is not part of this subject":
      return { finalMessage: `${firstName} ${lastName} nije dio ovog odjela`, status: "error" };
    case "Class session is not in progress":
      return { finalMessage: `Smjena nije u toku`, status: "error" };
    case "Invalid code":
      return { finalMessage: `Korišten zastarijeli kod`, status: "error" };
    case "Worker has arrived at class session":
      return { finalMessage: `${firstName} ${lastName} prijavljen na smjenu`, status: "arrival" };
    case "Worker has departed from class session":
      return { finalMessage: `${firstName} ${lastName} odjavljen sa smjene`, status: "departure" };
    case "Worker already attended this class session":
      return { finalMessage: `${firstName} ${lastName} je već prisustvovao ovoj smjeni`, status: "error" };
    default:
      return { finalMessage: "Greška", status: "error" };
  }
};