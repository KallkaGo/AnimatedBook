import styled from "styled-components";

export const GameWrapper = styled.div`
  width: 100%;
  height: 100%;

  .control {
    width: 100%;
    height: 100%;
  }

  .container {
    position: absolute;
    left: 50%;
    transform: translate(-50%);
    bottom: 100px;
    background-color: #ccc3;
    border-radius: 30px;
    display: flex;
    align-items: center;
  }

  .color-item::after {
    content: "";
    display: block;
    position: relative;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 38px;
    height: 38px;
    border-radius: 50%;
    border: 2px solid #fff;
  }

  .slider {
    position: absolute;
    left: 50%;
    transform: translate(-50%);
    bottom: 0px;
    display: flex;
    justify-content: center;
   
    width:100%;

    .slider-container{
        display: flex;
        align-items: center;
        gap: 1rem;
        padding:2.5rem;
    }
  }

  button {
    padding: 0.75rem 1rem;
    border-radius: 9999px;
    font-size: 1.125rem;
    line-height: 1.75rem;
    text-transform: uppercase;
    flex-shrink: 0;
    border-width: 1px;
    border-style: solid;
    border-color: transparent;
    transition: all 0.3s;
    cursor: pointer;
    font-family: Poppins,sans-serif;
  }

  button:hover {
    border-color:white
  }
`;
