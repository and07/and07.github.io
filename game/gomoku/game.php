<?php
$param = $_GET + $_POST;
session_start();
require_once(dirname(__FILE__) . '/classes.php');
// Получаем из сессии текущую игру.
// Если игры еще нет, создаём новую.
$game = isset($_SESSION['game'])? $_SESSION['game']: null;
if(!$game || !is_object($game)) {
    $game = new GomokuGame();
}

if(isset($param) && (int)$param['x'] >= 0 && $param['y']>=0){
	
	//$currentPlayer = ($game->getCurrentPlayer() == 1) ? 2 : 1;
	//$game->setCurrentPlayer($currentPlayer);
	$game->setField(json_decode($param['f']));
	$game->checkWinner();
	//$game->makeMove((int)$param['x'], (int)$param['y']);
	$_SESSION['game'] = $game;
	if( $game->getCurrentPlayer()){
		$msg = array( 'winnerCells' => $game->getWinnerCells(),'field' => $game->getField(), 'player' => $game->getCurrentPlayer(), 'position' => array( $param['x'], $param['y']));
	}
	if(!is_null($game->getWinner())){
		$msg = array( 'winner'=>$game->getWinner(),'winnerCells' => $game->getWinnerCells(),'field' => $game->getField(), 'player' => $game->getCurrentPlayer(), 'position' => array( $param['x'], $param['y']));
	}
	
	header('Content-Type: application/json');
	echo json_encode($msg);
	
}
