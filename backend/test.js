import pt from "puppeteer";

const testTripAdvisor = async (link) => {
  const browser = await pt.launch({ headless: false });
  const page = await browser.newPage();

  await page.goto(
    "https://www.tripadvisor.com/Commerce?p=BookingCom&src=33397699&geo=601550&from=HotelDateSearch_Hotels&slot=1&matchID=1&oos=0&cnt=4&silo=10494&bucket=903017&nrank=1&crank=1&clt=M&ttype=MobileCR&tm=309679692&managed=false&capped=false&gosox=q2BnQ43MX5f4xhwKylgjpKb8UjavzoLD_bCp4kxXvXoK64h0rlUnN9z9mjdYQ3wzJO13OXGZ8QpAXeXGwQNYugg0osVJoMoGiJD_AVLZbKBIJQ7n-uahgrh7unoOHhpvbUDbWOgQAH8aiVibDkb8yUnf5a2_CxZiw1Rc_T7f-SU4v3UZ8XhEvc5ry9uQQdLlnCyN5JnXFlBFLBE_GSjta6Fz3LicMgKdvrKvkiLXT-W2JQaVlHGOCe2Fdi5P4Ir80av-ilb3It1459DQJVp99g&priceShown=2413&pm=BR&hac=AVAILABLE&mbl=MEET&mbldelta=798&rq=P&rate=2413.42&taxesRate=241.3400&feesRate=265.4800&fees=506.8200&cur=AUD&adults=1&child_rm_ages=&inDay=27&outDay=31&rdex=RDEX_25e5ccf89df504c2f2ed3b1184bdb4b1&rooms=1&inMonth=10&inYear=2024&outMonth=10&outYear=2024&auid=55fef646-0b75-46ac-8106-ff7677b5e2e5&def_d=false&bld=L_4,D_3,G_1,W_7,U_0,C_241027,T_20&bh=true&cs=15250406243deb507eaa767b7808ebf69&ik=a20830758f88464ca1cd9520711ed548&aok=23f5574a509d4e04ac43453ee37bb7bb&tp=APS-Hotels&pageLocId=601550"
  );
  await page.waitForNavigation();
  console.log("Redirected ");
};
testTripAdvisor();
