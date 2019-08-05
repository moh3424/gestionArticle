<?php

namespace App\DataFixtures;

use Faker\Factory;
use App\Entity\User;
use App\Entity\Article;
use App\Entity\Comment;
use App\Entity\Category;
use App\Entity\ArticleLike;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Common\Persistence\ObjectManager;
use Symfony\Component\Security\Core\Encoder\UserPasswordEncoderInterface;


class ArticleFixtures extends Fixture
{

  /**
   * @var UserPasswordEncoderInterface
   */
  public function __construct(UserPasswordEncoderInterface $encoder)
  {
    $this->encoder = $encoder;
  }

  public function load(ObjectManager $manager)
  {
    $faker = \Faker\Factory::create('fr_FR');
    $users = [];
    $user = new User();
    $user->setEmail('user@symfony.com')
      ->setUsername($faker->username)
      ->setPassword($this->encoder->encodePassword($user, 'password'));
    $manager->persist($user);

    $users[] = $user;

    for ($i = 0; $i < 20; $i++) {
      $user = new User();
      $user->setEmail($faker->email)
        ->setUsername($faker->username)
        ->setPassword($this->encoder->encodePassword($user, 'password'));

      $manager->persist($user);
      $users[] = $user;
    }

    // Créer 3 categories fakées
    for ($i = 1; $i <= 3; $i++) {
      $category = new Category();
      $category->setTitle($faker->sentence())
        ->setDescription($faker->paragraph());
      $manager->persist($category);

      // Créer entre 4 et 6 articles
      for ($j = 1; $j <= mt_rand(4, 6); $j++) {
        $article = new Article();

        $content = '<p>' . join($faker->paragraphs(5), '</p><p>') . '</p>';

        $article->setTitle($faker->sentence())
          ->setIntroduction($faker->sentence())
          ->setContent($content)
          ->setImage($faker->imageUrl())
          ->setCreatedAt($faker->dateTimeBetween('-6 months'))
          ->setCategory($category);

        $manager->persist($article);
        // Créer entre 0 et 10  like pour un article
        for ($l = 0; $l < mt_rand(0, 10); $l++) {
          $like = new ArticleLike();
          $like->setArticle($article)
            ->setUser($faker->randomElement($users));
          $manager->persist($like);
        }

        // On donne des commentaires à l'articles
        for ($k = 1; $k <= mt_rand(4, 6); $k++) {
          $comment = new Comment();
          $content .= '<p>' . join($faker->paragraphs(2), '</p><p>') . '</p>';
          $now = new \DateTime();
          $interval = $now->diff($article->getCreatedAt());
          $days = $interval->days;
          $minimum = '-' . $days . ' days';
          $comment->setAuthor($faker->name)
            ->setContent($content)
            ->setCreatedAt($faker->dateTimeBetween($minimum))
            ->setArticle($article);
          $manager->persist($comment);
        }
      }
    }
    $manager->flush();
  }
}
