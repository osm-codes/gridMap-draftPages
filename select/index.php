<?php
function getTemplate($template, $dir = "templates/")
{
  $f = $dir.$template;
  $c = '';
  if (is_file($f))
  {
    $c = file_get_contents($f);
  }
  return $c;
};

function parseTemplate($template, $arr)
{
  foreach ($arr as $a => $b)
  {
    $template = str_replace('{'.$a.'}',$b,$template);
  }
  return $template;
};

$x = str_replace("/","",$_SERVER['REQUEST_URI']);

$pattern1 = '/([a-zA-Z]{2})\+/i';
$pattern2 = '/^([a-zA-Z]{2})(\-|~)$/i';
$pattern3 = '/^([a-zA-Z]{2})(\-|~|\+)$/i';
$replacement1 = '${1}';

$xx = explode("-", preg_replace($pattern3, $replacement1, $x));

$arrTags = array(
	'country'=>$xx[0]
);

switch ($xx[0]) {
  case "BR":
    echo parseTemplate(getTemplate('pt.html'),$arrTags);
    echo getTemplate('infobox-BR.html');

    if (preg_match($pattern1,$x))
    {
        echo getTemplate('infobox-BRsci.html');
    }
    else if (preg_match($pattern2,$x))
    {
        echo getTemplate('infobox-BRlog.html');
    }
    else
    {
        echo getTemplate('infobox-BRsci.html');
        echo getTemplate('infobox-BRlog.html');
    };

    echo getTemplate('common.html');
    break;
  case "CO":
    echo parseTemplate(getTemplate('es.html'),$arrTags);
    echo getTemplate('infobox-CO.html');
    echo getTemplate('common.html');
    break;
  default:
    echo parseTemplate(getTemplate('es.html'),$arrTags);
    echo getTemplate('common.html');
    break;
};
?>
