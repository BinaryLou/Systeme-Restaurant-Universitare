import ReservationHeader from "../../components/student/reservation/ReservationHeader";
import ReservationCalendar from "../../components/student/reservation/ReservationCalendar";
import ServiceSelector from "../../components/student/reservation/ServiceSelector";
import ReservationRecap from "../../components/student/reservation/ReservationRecap";
import ReservationSuccess from "../../components/student/reservation/ReservationSuccess";
import { useReservationPage } from "../../hooks/useReservationPage";

const StudentReservation = () => {
  const reservation = useReservationPage();

  if (reservation.successData) {
    return <ReservationSuccess reservation={reservation} />;
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] px-3 py-5 sm:px-6 lg:px-8 lg:py-8 animate-page-fade">
      <ReservationHeader />

      <div className="mt-8 grid grid-cols-1 gap-8 xl:grid-cols-[1fr_390px]">
        <div>
          <ReservationCalendar reservation={reservation} />
        </div>

        <aside className="sticky top-8 h-fit space-y-6">
          <ServiceSelector reservation={reservation} />

          {reservation.canShowRecap && (
            <ReservationRecap reservation={reservation} />
          )}
        </aside>
      </div>
    </div>
  );
};

export default StudentReservation;
