function init_plugins() {

 $( document ).ready(function() {
	  console.log( "my scripts" );

	  /*=================================
	  =            Side Menu            =
	  =================================*/
		$('.side-menu').metisMenu({ preventDefault: true });
		/*if ($('.menu-item-has-children > ul li a.active')) {
      $($('.menu-item-has-children > ul li a.active')).parents('.menu-item-has-children').toggleClass('active');
      $($('.menu-item-has-children > ul li a.active')).parents('.sub-menu').collapse();
    }*/
	  
	});
}