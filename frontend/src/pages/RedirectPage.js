import axios from "axios";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import iconUserProfile from "../assets/icon_userprofile.png";

function RedirectPage() {
  const navigate = useNavigate();
  const baseUrl = "https://6596-210-94-220-228.ngrok-free.app/oauth/login"; // 배포 링크

  useEffect(() => {
    // URL에 success를 추가하여 호출
    const urlWithSuccess = `${baseUrl}/success`;

    // Spring Boot API에서 회원 정보 가져오기
    axios
      .get(urlWithSuccess)
      .then((response) => {
        const userInfo = response.data;

        // 회원 정보 저장
        localStorage.setItem("userInfo", JSON.stringify(userInfo));

        // 메인 페이지로 이동
        navigate("/");
      })
      .catch((error) => {
        console.error("회원 정보 가져오기 실패:", error);
      });
  }, [navigate]);

  return (
    <div>
      <h1>회원가입 성공!</h1>
      <p>잠시만 기다려 주세요. 페이지로 이동 중입니다...</p>
    </div>
  );
}

export default RedirectPage;
